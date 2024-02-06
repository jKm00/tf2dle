<script lang="ts">
	import type { MapGuessResponse } from '$lib/dtos';
	import { ArrowBigDown, ArrowBigUp } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	// The guesses made by the user
	export let guesses: MapGuessResponse[];
</script>

<div class="grid gap-4">
	{#if guesses.length > 0}
		<div class="custom-grid gap-4 font-semibold">
			<p>Image</p>
			<p>Game Mode</p>
			<p>Release Year</p>
		</div>
	{/if}
	<div class="custom-grid gap-4 text-sm">
		{#each guesses as guess (guess.name)}
			{@const fadeDuration = 500}
			<img
				in:fade={{ duration: fadeDuration }}
				class={`w-full aspect-video object-cover rounded border ${
					guess.correct ? 'border-correct' : 'border-incorrect'
				}`}
				src={`/images/maps/thumbnails/${guess.thumbnail}.png`}
				alt={guess.name.value}
			/>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 1 }}
				class={`${
					guess.gameModes.status === 'correct'
						? 'border-correct'
						: guess.gameModes.status === 'partial'
							? 'border-partial'
							: 'border-incorrect'
				} flex items-center justify-center text-center gap-2 rounded-sm border p-1`}
			>
				{guess.gameModes.value.join(', ')}
			</p>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 2 }}
				class={`${
					guess.releaseDate.status === 'correct' ? 'border-correct' : 'border-incorrect'
				} flex items-center justify-center gap-1 rounded-sm border p-1`}
			>
				{guess.releaseDate.value}
				<ArrowBigDown class={guess.releaseDate.status === 'earlier' ? '' : 'hidden'} />
				<ArrowBigUp class={guess.releaseDate.status === 'later' ? '' : 'hidden'} />
			</p>
		{/each}
	</div>
</div>

<style scoped>
	.custom-grid {
		display: grid;
		grid-template-columns: 7rem 2fr 1fr;
	}
</style>
