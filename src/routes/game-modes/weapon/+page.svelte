<script lang="ts">
	import Input from '$lib/components/games/Input.svelte';
	import { onMount } from 'svelte';
	import type { WeaponGuessResponse } from '$lib/dtos.js';
	import GuessesList from './GuessesList.svelte';
	import { useGameEngine } from '$lib/composables/useGameEngine';
	import { writable } from 'svelte/store';
	import GameShell from '$lib/components/games/GameShell.svelte';

	// Data
	export let data;
	let numberOfCorrectGuesses = writable<number | undefined>(undefined);
	let weapons: string[] = [];

	let loadingState: 'loading' | 'error' | 'success' = 'loading';

	const { gameState, guesses, streak, stats, validating, openVictoryDialog, handleGuess } =
		useGameEngine<WeaponGuessResponse>('weapon', 6, numberOfCorrectGuesses);

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

<GameShell
	title="Weapon"
	description="Guess today's weapon"
	img={{ basePath: '/images/weapons/thumbnails/', guessKey: 'name' }}
	{loadingState}
	{guesses}
	{streak}
	{stats}
	{numberOfCorrectGuesses}
	{openVictoryDialog}
>
	<div class="grid gap-4">
		{#if $gameState === 'guessing'}
			<p class="text-center text-sm text-muted-foreground" data-testId="number-of-correct-guesses">
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
			<p class="text-center text-sm text-muted-foreground my-10" data-testId="completed-message">
				You are 1 out of {$numberOfCorrectGuesses} that have guessed todays weapon!
			</p>
		{/if}
		<GuessesList guesses={$guesses} />
	</div>
</GameShell>
