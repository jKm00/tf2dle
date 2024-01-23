<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/features/gameModes/map/Input.svelte';
	import ImageShowcase from '$lib/features/gameModes/map/ImageShowcase.svelte';
	import dayjs from 'dayjs';
	import TwitterShare from '$lib/features/gameModes/map/TwitterShare.svelte';
	import type { MapGuessResponse } from '$lib/dtos.js';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import ColorExplanation from '$lib/components/ColorExplanation.svelte';
	import GuessesList from '$lib/features/gameModes/map/GuessesList.svelte';
	import VictoryDialog from '$lib/features/gameModes/map/VictoryDialog.svelte';

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
					<GuessesList guesses={$guesses.reverse()} />
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	<VictoryDialog
		bind:open={openDialog}
		imageUrl={todaysMap?.image.url ?? ''}
		mapName={todaysMapName}
		tries={$guesses.length}
		streak={$streak}
	/>
</div>
