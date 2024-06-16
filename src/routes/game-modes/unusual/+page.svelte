<script lang="ts">
	import GameShell from '$lib/components/games/GameShell.svelte';
	import Input from '$lib/components/games/Input.svelte';
	import { useGameEngine } from '$lib/composables/useGameEngine';
	import type { UnusualGuessResponse } from '$lib/dtos.js';
	import { writable } from 'svelte/store';

	export let data;

	$: ({ todaysUnusual, unusuals } = data);

	let numberOfCorrectGuesses = writable<number | undefined>(undefined);

	let loadingState: 'loading' | 'error' | 'success' = 'loading';

	$: if (todaysUnusual) {
		numberOfCorrectGuesses.set(todaysUnusual.numberOfCorrectGuesses);
		loadingState = 'success';
	}

	const { gameState, guesses, streak, stats, validating, openVictoryDialog, handleGuess } =
		useGameEngine<UnusualGuessResponse>('unusual', numberOfCorrectGuesses);
</script>

<GameShell
	title="Unusuals"
	description="Guess today's unusual effect"
	{loadingState}
	{guesses}
	{streak}
	{stats}
	{numberOfCorrectGuesses}
	{openVictoryDialog}
>
	<div class="grid gap-4">
		{#if todaysUnusual}
			<div>{todaysUnusual}</div>
		{/if}
		<p>Some hints</p>
		{#if $gameState === 'guessing'}
			<p class="text-sm text-center text-muted-foreground">
				{$numberOfCorrectGuesses}
				{$numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} have guessed todays unusual
			</p>
			<Input
				data={unusuals.map((u) => ({
					img: `/images/unusuals/${u.thumbnail}`,
					value: u.name
				}))}
				guessed={$guesses.map((guess) => guess.name.value)}
				bind:validating={$validating}
				on:select={(e) => handleGuess(e.detail)}
			/>
		{:else}
			<p class="text-sm text-center text-muted-foreground">
				You are 1 out of {$numberOfCorrectGuesses} that have guessed todays unusual
			</p>
		{/if}
	</div>
</GameShell>
