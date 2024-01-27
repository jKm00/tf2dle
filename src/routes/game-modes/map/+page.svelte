<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/games/Input.svelte';
	import ImageShowcase from '$lib/features/gameModes/map/ImageShowcase.svelte';
	import dayjs from '$lib/configs/dayjsConfig';
	import type { MapGuessResponse } from '$lib/dtos.js';
	import ColorExplanation from '$lib/components/games/ColorExplanation.svelte';
	import GuessesList from '$lib/features/gameModes/map/GuessesList.svelte';
	import VictoryDialog from '$lib/components/games/VictoryDialog.svelte';
	import { Dices, Flame } from 'lucide-svelte';

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
			guesses.set([]);
			streak.set(0);
			gameState = 'guessing';
			return;
		}

		// Reset streak if last victory was more than 1 days ago
		if (
			dayjs($lastEvent.date).isBefore(dayjs.utc().subtract(1, 'day'), 'day') ||
			$lastEvent.event !== 'won'
		) {
			streak.set(0);
		}

		// Initialize game state
		switch ($lastEvent.event) {
			case 'won':
				if (dayjs($lastEvent.date).isSame(dayjs.utc(), 'date')) {
					gameState = 'won';
				} else {
					gameState = 'guessing';
					guesses.set([]);
				}
				break;
			case 'guessed':
				gameState = 'guessing';
				if (!dayjs($lastEvent.date).isSame(dayjs.utc(), 'date')) {
					guesses.set([]);
				}
				break;
		}
	});

	async function handleSelect(name: string) {
		if (gameState === 'won') return;

		lastEvent.set({ event: 'guessed', date: dayjs.utc().format() });

		const result = await checkGuess(name);

		if (result) {
			guesses.update((guesses) => [result, ...guesses]);
		}

		if (result?.correct) {
			won(result.name.value);
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
			lastEvent.set({ event: 'won', date: dayjs.utc().format() });
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
						url={`/images/maps/originals/${todaysMap.image.url}.png`}
						startingPos={todaysMap.image.startingPos}
						numberOfGuesses={$guesses.length}
						hasWon={gameState === 'won'}
					/>
					{#if gameState !== 'won'}
						<Input
							on:select={(event) => handleSelect(event.detail)}
							data={maps?.map((map) => ({
								img: `/images/maps/thumbnails/${map.thumbnail}.png`,
								value: map.name
							}))}
							guessed={$guesses.map((guess) => guess.name.value)}
						/>
					{/if}
					<GuessesList guesses={$guesses} />
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	<p class="text-center text-sm">
		{todaysMap?.correctGuesses ?? 0}
		{todaysMap ? (todaysMap.correctGuesses > 1 ? 'gamers' : 'gamer') : 'gamers'} has already guessed
		todays map
	</p>

	<VictoryDialog
		bind:open={openDialog}
		img={{
			src: `/images/maps/originals/${todaysMap?.image.url}.png`,
			alt: todaysMapName
		}}
		label="Map"
		value={todaysMapName}
		tries={$guesses.length}
		streak={$streak}
		correctGuesses={todaysMap?.correctGuesses ?? 0}
		challenge="map"
	/>
</div>
