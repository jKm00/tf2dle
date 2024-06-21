<script lang="ts">
	import type { UnusualGuessResponse } from '$lib/dtos';
	import { fade, scale } from 'svelte/transition';

	// The guesses made by the user
	export let guesses: UnusualGuessResponse[];
</script>

<div class="grid gap-2">
	{#if guesses.length > 0}
		<div class="flex gap-4 font-semibold">
			<p class="w-20">Image</p>
			<p>Name</p>
		</div>
	{/if}
	{#each guesses as guess (guess.name)}
		{@const fadeDuration = 500}
		<div class="flex gap-4">
			<img
				in:fade={{ duration: fadeDuration }}
				src={`/images/unusuals/${guess.thumbnail}.png`}
				alt={guess.name}
				class="w-20 rounded-sm"
			/>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 1 }}
				class="flex items-center rounded-sm flex-grow justify-center {guess.correct
					? 'bg-correct text-correct-foreground'
					: 'bg-incorrect text-incorrect-foreground'}"
			>
				{guess.name}
			</p>
		</div>
	{/each}
</div>
