<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/features/gameModes/map/Input.svelte';
	import ImageShowcase from '$lib/features/gameModes/map/ImageShowcase.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { MapGuessResponse } from '$lib/dtos.js';
	import ColorExplanation from '$lib/components/ColorExplanation.svelte';
	import GuessesList from '$lib/features/gameModes/map/GuessesList.svelte';
	import VictoryDialog from '$lib/features/gameModes/map/VictoryDialog.svelte';
	import { Dices, Flame } from 'lucide-svelte';

	dayjs.extend(utc);

	export let data;

	$: ({ todaysMap, maps } = data);

	let gameState: 'guessing' | 'won';
	let lastEvent = useLocalStorage<{ event: 'won' | 'guessed'; date: string } | null>(
		'map_last_event',
		null
	);
	let guesses = useLocalStorage<MapGuessResponse[]>('map_guesses', []);
	let streak = useLocalStorage<number>('map_streak', 0);

	let todaysMapName: string = '';
	let openDialog = false;

	onMount(() => {
		if ($lastEvent === null) {
			streak.set(0);
			gameState = 'guessing';
			return;
		}

		// Reset streak if last event was more than 1 days ago
		if (
			dayjs($lastEvent.date).isBefore(dayjs().utc().subtract(2, 'day')) ||
			$lastEvent.event !== 'won'
		) {
			streak.set(0);
		}

		// Initialize game state
		switch ($lastEvent.event) {
			case 'won':
				if ($lastEvent.date === dayjs().utc().toDate().toDateString()) {
					gameState = 'won';
				} else {
					gameState = 'guessing';
					guesses.set([]);
				}
				break;
			case 'guessed':
				gameState = 'guessing';
				if ($lastEvent.date !== dayjs().utc().toDate().toDateString()) {
					guesses.set([]);
				}
				break;
		}
	});

	async function handleSelect(map: { name: string; thumbnail: string }) {
		if (gameState === 'won') return;

		lastEvent.set({ event: 'guessed', date: dayjs().utc().toDate().toDateString() });

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

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	function won(mapName: string) {
		// Wait for reveal animation to finish
		setTimeout(() => {
			lastEvent.set({ event: 'won', date: dayjs().utc().toDate().toDateString() });
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
			<div class="flex justify-between">
				<div>
					<Card.Title>Map</Card.Title>
					<Card.Description>Guess today's map</Card.Description>
				</div>
				<div class="flex gap-4">
					<p class="flex items-center">
						<Dices aria-label="Number of guesses" />
						{$guesses.length}
					</p>
					<p class="flex items-center"><Flame aria-label="streak" /> {$streak}</p>
				</div>
			</div>
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
					<GuessesList guesses={[...$guesses].reverse()} />
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
