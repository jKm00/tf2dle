<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { AreaChart, Dices, Flame, Loader2, RotateCw } from 'lucide-svelte';
	import Input from '$lib/components/games/Input.svelte';
	import { onMount } from 'svelte';
	import type { WeaponGuessResponse } from '$lib/dtos.js';
	import GuessesList from './GuessesList.svelte';
	import VictoryDialog from '$lib/components/games/VictoryDialog.svelte';
	import ColorExplanation from '$lib/components/games/ColorExplanation.svelte';
	import StatsDialog from '$lib/components/games/StatsDialog.svelte';
	import { useGameEngine } from '$lib/composables/useGameEngine';
	import { writable } from 'svelte/store';

	export let data;
	// Data
	let numberOfCorrectGuesses = writable<number | undefined>(undefined);
	let weapons: string[] = [];

	let openStatsDialog = false;
	let loadingState: 'loading' | 'error' | 'success' = 'loading';

	const { gameState, guesses, streak, stats, validating, openVictoryDialog, handleGuess } = useGameEngine<WeaponGuessResponse>('weapon', numberOfCorrectGuesses);

	onMount(async () => {
		// Load data
		try {
			const [res1, res2] = await Promise.all([data.numberOfCorrectGuesses, data.weapons]);
			numberOfCorrectGuesses.set(res1 ?? 0);
			weapons = res2 ?? [];
		} catch (err) {
			loadingState = 'error';
			return;
		}

		loadingState = 'success';
	});
</script>

<div class="grid gap-4">
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title data-testId="title">Weapon</Card.Title>
					<Card.Description>Guess today's weapon</Card.Description>
				</div>
				<div class="flex gap-4">
					<p class="flex items-center gap-1">
						<Dices aria-label="Number of guesses" />
						{$guesses.length}
					</p>
					<p class="flex items-center gap-1">
						<Flame aria-label="Streak" />
						{$streak}
					</p>
					<button on:click={() => (openStatsDialog = true)} data-testId="openStatsDialog">
						<AreaChart aria-label="Stats" />
					</button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			{#if loadingState === 'loading'}
				<div class="flex justify-center p-4">
					<Loader2 class="h-4 w-4 animate-spin" />
				</div>
			{:else if loadingState === 'error'}
				<a
					href="/game-modes/weapon"
					class="grid justify-items-center gap-4 p-4"
					data-testId="refresh"
				>
					Something went wrong. Please try to refresh.
					<RotateCw class="w-4 h-4" />
				</a>
			{:else}
				<div class="grid gap-4">
					{#if $gameState === 'guessing'}
						<p
							class="text-center text-sm text-muted-foreground"
							data-testId="number-of-correct-guesses"
						>
							{$numberOfCorrectGuesses}
							{$numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} have guessed todays weapon
						</p>
						<Input
							data={weapons?.map((weapon) => ({
								img: `/images/weapons/thumbnails/${weapon}.png`,
								value: weapon
							}))}
							guessed={$guesses.map((guess) => guess.name)}
							on:select={(e) => handleGuess(e.detail)}
							bind:validating={$validating}
						/>
					{:else}
						<p
							class="text-center text-sm text-muted-foreground my-10"
							data-testId="completed-message"
						>
							You are 1 out of {$numberOfCorrectGuesses} that have guessed todays weapon!
						</p>
					{/if}
					<GuessesList guesses={$guesses} />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	<StatsDialog bind:open={openStatsDialog} stats={$stats} />

	{#if $guesses.length > 0}
		<VictoryDialog
			img={{ src: `/images/weapons/thumbnails/${$guesses[0].name}.png`, alt: $guesses[0].name }}
			imgSize="10rem"
			challenge="Weapon"
			value={$guesses[0].name}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={$numberOfCorrectGuesses ?? 1}
			nextChallenge="/game-modes/map"
			bind:open={$openVictoryDialog}
		/>
	{/if}
</div>
