<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/games/Input.svelte';
	import ImageShowcase from './ImageShowcase.svelte';
	import type { MapGuessResponse } from '$lib/dtos.js';
	import ColorExplanation from '$lib/components/games/ColorExplanation.svelte';
	import GuessesList from './GuessesList.svelte';
	import VictoryDialog from '$lib/components/games/VictoryDialog.svelte';
	import { AreaChart, Dices, Flame, RotateCw } from 'lucide-svelte';
	import StatsDialog from '$lib/components/games/StatsDialog.svelte';
	import { GameState, useGameEngine } from '$lib/composables/useGameEngine2';

	export let data;

	$: ({ todaysMap } = data);

	let openStatsDialog = false;
	let openVictoryDialog = false;
	let numberOfCorrectGuesses: number | undefined = undefined;
	let todaysMapName = useLocalStorage<string>('map_answer', '');

	const { state, stats, guesses, streak, validating, init, guess } =
		useGameEngine<MapGuessResponse>({
			name: 'map',
			apiRoute: 'map',
			victoryMessageDelay: 1500,
			onReset,
			onWon
		});

	onMount(async () => {
		// Load data
		numberOfCorrectGuesses = (await todaysMap)?.correctGuesses ?? 0;

		init();
	});

	function onReset() {
		todaysMapName.set('');
	}

	function onWon(result: MapGuessResponse) {
		todaysMapName.set(result.name.value);
		numberOfCorrectGuesses = numberOfCorrectGuesses ? numberOfCorrectGuesses + 1 : 1;
		openVictoryDialog = true;
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
					<button on:click={() => (openStatsDialog = true)}>
						<AreaChart aria-label="Stats" />
					</button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				{#await data.todaysMap}
					<div class="aspect-video bg-muted animate-pulse"></div>
				{:then todaysMap}
					{#if todaysMap}
						<ImageShowcase
							url={`/images/maps/originals/${todaysMap.image.url}.png`}
							startingPos={todaysMap.image.startingPos}
							numberOfGuesses={$guesses.length}
							hasWon={$state === GameState.WON}
							mapName={$todaysMapName}
						/>
						{#await data.maps then maps}
							{#if $state === GameState.GUESSING}
								{#if numberOfCorrectGuesses !== undefined}
									<p class="text-center text-sm text-muted-foreground">
										{numberOfCorrectGuesses}
										{numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} has guessed todays map
									</p>
								{/if}
								<Input
									on:select={(event) => guess(event.detail)}
									data={maps?.map((map) => ({
										img: `/images/maps/thumbnails/${map.thumbnail}.png`,
										value: map.name
									}))}
									guessed={$guesses.map((guess) => guess.name.value)}
									bind:validating={$validating}
								/>
							{:else if numberOfCorrectGuesses !== undefined}
								<p class="text-center text-sm text-muted-foreground">
									You are 1 out of {numberOfCorrectGuesses} that have guessed todays map!
								</p>
							{/if}
						{/await}
						<GuessesList guesses={$guesses} />
					{/if}
				{:catch error}
					<a
						data-sveltekit-reload
						href="/game-modes/map"
						class="grid justify-items-center gap-4 p-4"
						data-testId="refresh"
					>
						{error.body.message}
						<RotateCw class="w-4 h-4" />
					</a>
				{/await}
			</div>
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	<StatsDialog bind:open={openStatsDialog} stats={$stats} />

	{#await data.todaysMap then todaysMap}
		<VictoryDialog
			bind:open={openVictoryDialog}
			img={{
				src: `/images/maps/originals/${todaysMap?.image.url}.png`,
				alt: $todaysMapName
			}}
			challenge="Map"
			value={$todaysMapName}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={numberOfCorrectGuesses ?? 1}
			nextChallenge="/game-modes/cosmetic"
		/>
	{/await}
</div>
