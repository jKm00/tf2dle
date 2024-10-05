<script lang="ts">
	import GameShell from '$lib/components/games/GameShell.svelte';
	import Input from '$lib/components/games/Input.svelte';
	import { useGameEngine } from '$lib/composables/useGameEngine';
	import type { WeaponTwoGuessResponse } from '$lib/dtos.js';
	import { writable } from 'svelte/store';

	export let data;

	$: ({ todaysWeapon, weapons } = data);

	let numberOfCorrectGuesses = writable<number>(0);

	let loadingState: 'loading' | 'error' | 'success' = 'loading';

	$: if (todaysWeapon) {
		numberOfCorrectGuesses.set(todaysWeapon.numberOfCorrectGuesses);
		loadingState = 'success';
	}

	const { gameState, guesses, streak, stats, validating, openVictoryDialog, handleGuess } =
		useGameEngine<WeaponTwoGuessResponse>('weapon-2', 1, numberOfCorrectGuesses);
</script>

<GameShell
	title="Weapon 2"
	description="Guess today's weapon based on its attributes"
	img={{ basePath: '/images/weapons/thumbnails', guessKey: 'name' }}
	nextChallenge="/game-modes/map"
	{loadingState}
	{guesses}
	{streak}
	{stats}
	{numberOfCorrectGuesses}
	{openVictoryDialog}
>
	<div>
		{#if todaysWeapon}
			<div class="grid gap-4 text-sm justify-items-center mb-8">
				<div class="size-20 bg-muted rounded-md"></div>
				<h2 class="bg-muted rounded-md text-xl w-[150px] text-muted">No cheating!</h2>
				<div class="grid gap-1 text-center">
					{#each todaysWeapon.weapon.attributes as attribute}
						{@const color =
							attribute.variant === 'positive'
								? 'text-positive'
								: attribute.variant === 'negative'
									? 'text-negative'
									: 'text-neutral'}
						<p class={color}>{attribute.text}</p>
					{/each}
				</div>
			</div>
		{/if}
		{#if $gameState === 'guessing'}
			<p class="text-sm text-center text-muted-foreground mb-2">
				{$numberOfCorrectGuesses}
				{$numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} have guessed todays unusual
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
			<p class="text-sm text-center text-muted-foreground">
				You are 1 our of {$numberOfCorrectGuesses} that have guessed todays weapon
			</p>
		{/if}
	</div>
</GameShell>
