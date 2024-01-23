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

	export let data;

	$: ({ todaysMap, maps } = data);

	let gameState: 'guessing' | 'won';
	let lastEvent = useLocalStorage<{ event: 'won' | 'guessed'; date: string } | null>(
		'map-last-event',
		null
	);
	let guesses = useLocalStorage<{ mapName: string; thumbnail: string; correct: boolean }[]>(
		'map-guesses',
		[]
	);
	let streak = useLocalStorage<number>('map-streak', 0);

	let todaysMapName: string = '2Fort';
	let openDialog = true;

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
		const correct = result !== null;
		guesses.update((guesses) => [
			...guesses,
			{ mapName: map.name, thumbnail: map.thumbnail, correct }
		]);

		if (correct) {
			won(result);
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
			const data = await res.json();

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	function won(mapName: string) {
		gameState = 'won';
		lastEvent.set({ event: 'won', date: new Date().toDateString() });
		streak.update((streak) => streak + 1);
		todaysMapName = mapName;
		openDialog = true;
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
							guessedMaps={$guesses.map((guess) => guess.mapName)}
						/>
					{/if}
					{#if $guesses.length > 0}
						<ul class="grid gap-4">
							<h4 class="font-semibold">Your guesses:</h4>
							{#each $guesses as guess (guess.mapName)}
								<li
									class={`flex items-center gap-4 rounded ${guess.correct ? 'bg-green-800' : ''}`}
								>
									<img class="w-20 rounded" src={guess.thumbnail} alt={guess.mapName} />
									{guess.mapName}
								</li>
							{/each}
						</ul>
					{/if}
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
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
