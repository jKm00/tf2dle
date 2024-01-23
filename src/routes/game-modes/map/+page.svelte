<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/features/gameModes/map/Input.svelte';
	import ImageShowcase from '$lib/components/features/gameModes/map/ImageShowcase.svelte';
	import dayjs from 'dayjs';
	import TwitterShare from '$lib/components/features/gameModes/map/TwitterShare.svelte';
	import type { MapGuessResponse } from '$lib/dtos.js';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import ColorExplanation from '$lib/components/ColorExplanation.svelte';

	export let data;

	$: ({ todaysMap, maps } = data);

	let gameState: 'guessing' | 'won';
	let lastEvent = useLocalStorage<{ event: 'won' | 'guessed'; date: string } | null>(
		'map-last-event',
		null
	);
	let guesses = useLocalStorage<MapGuessResponse[]>('map-guesses', []);
	let streak = useLocalStorage<number>('map-streak', 0);

	let todaysMapName: string = '';
	let openDialog = false;

	onMount(() => {
		if ($lastEvent === null) {
			streak.set(0);
			gameState = 'guessing';
			return;
		}

		// Reset streak if last event was more than 1 days ago
		if (dayjs($lastEvent.date).isBefore(dayjs().subtract(2, 'day')) || $lastEvent.event !== 'won') {
			streak.set(0);
		}

		// Initialize game state
		switch ($lastEvent.event) {
			case 'won':
				if ($lastEvent.date === new Date().toDateString()) {
					gameState = 'won';
				} else {
					gameState = 'guessing';
					guesses.set([]);
				}
				break;
			case 'guessed':
				gameState = 'guessing';
				if ($lastEvent.date !== new Date().toDateString()) {
					guesses.set([]);
				}
				break;
		}
	});

	async function handleSelect(map: { name: string; thumbnail: string }) {
		lastEvent.set({ event: 'guessed', date: new Date().toDateString() });

		const result = await checkGuess(map.name);

		if (result) {
			guesses.update((guesses) => [...guesses, result]);
		}

		if (result?.correct) {
			won(result.name);
		}
	}

	async function checkGuess(value: string) {
		try {
			const res = await fetch('/api/v1/game-modes/map', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ guess: value })
			});
			const data = (await res.json()) as MapGuessResponse;

			console.log(data);

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	function won(mapName: string) {
		// Wait for reveal animation to finish
		setTimeout(() => {
			lastEvent.set({ event: 'won', date: new Date().toDateString() });
			streak.update((streak) => streak + 1);
			todaysMapName = mapName;
			gameState = 'won';
			openDialog = true;
		}, 2000);
	}
</script>

<div class="grid gap-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Map</Card.Title>
			<Card.Description>Guess today's map</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				{#if todaysMap}
					<ImageShowcase
						url={todaysMap.image.url}
						startingPos={todaysMap.image.startingPos}
						numberOfGuesses={$guesses.length}
						hasWon={gameState === 'won'}
					/>
					{#if gameState !== 'won'}
						<Input
							on:select={(event) => handleSelect(event.detail)}
							{maps}
							guessedMaps={$guesses.map((guess) => guess.name)}
						/>
					{/if}
					{#if $guesses.length > 0}
						<div class="grid gap-4">
							<h4 class="font-semibold">Your guesses:</h4>
							<div class="custom-grid gap-4 font-semibold">
								<p>Image</p>
								<p>Name</p>
								<p>Game Mode</p>
								<p>Release Date</p>
							</div>
							<div class="custom-grid gap-4">
								{#each $guesses.reverse() as guess (guess.name)}
									{@const fadeDuration = 500}
									<img
										in:fade={{ duration: fadeDuration }}
										class="w-full rounded"
										src={guess.thumbnail}
										alt={guess.name}
									/>
									<p
										in:fade={{ duration: fadeDuration, delay: fadeDuration }}
										class={`${
											guess.correct ? 'bg-green-500' : 'bg-red-500'
										} flex items-center justify-center gap-2 rounded-sm`}
									>
										{guess.name}
									</p>
									<p
										in:fade={{ duration: fadeDuration, delay: fadeDuration * 2 }}
										class={`${
											guess.gameModes.correct === 'correct'
												? 'bg-green-500'
												: guess.gameModes.correct === 'partial'
													? 'bg-orange-500'
													: 'bg-red-500'
										} flex items-center justify-center text-center gap-2 rounded-sm`}
									>
										{guess.gameModes.value.join(', ')}
									</p>
									<p
										in:fade={{ duration: fadeDuration, delay: fadeDuration * 3 }}
										class={`${
											guess.releaseDate.correct === 'correct' ? 'bg-green-500' : 'bg-red-500'
										} flex items-center justify-center gap-2 rounded-sm`}
									>
										{guess.releaseDate.value}
										<ChevronDown class={guess.releaseDate.correct === 'later' ? '' : 'hidden'} />
										<ChevronUp class={guess.releaseDate.correct === 'earlier' ? '' : 'hidden'} />
									</p>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	<Dialog.Root bind:open={openDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Won!</Dialog.Title>
				<Dialog.Description>You guessed the correct map!</Dialog.Description>
			</Dialog.Header>
			<div class="grid">
				<img src={todaysMap?.image.url} alt={todaysMapName} class="w-full rounded-sm mb-4" />
				<div class="grid gap-2 border p-4 rounded-sm mb-4">
					<p class="flex justify-between">
						<span class="font-semibold">Name:</span>
						{todaysMapName}
					</p>
					<p class="flex justify-between">
						<span class="font-semibold">Tries:</span>
						{$guesses.length}
					</p>
					<p class="flex justify-between">
						<span class="font-semibold">Streak:</span>
						{$streak}
					</p>
				</div>
				<!-- TODO: Add share button -->
				<TwitterShare tries={$guesses.length} streak={$streak} class="mb-2">Share</TwitterShare>
				<Button on:click={() => (openDialog = false)} variant="secondary">Close</Button>
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>

<style scoped>
	.custom-grid {
		display: grid;
		grid-template-columns: 5rem repeat(3, 1fr);
	}
</style>
