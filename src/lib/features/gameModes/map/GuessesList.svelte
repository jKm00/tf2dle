<script lang="ts">
	import type { MapGuessResponse } from '$lib/dtos';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	export let guesses: MapGuessResponse[];
</script>

<div class="grid gap-4">
	{#if guesses.length > 0}
		<h4 class="font-semibold">Your guesses:</h4>
		<div class="custom-grid gap-4 font-semibold">
			<p>Image</p>
			<p>Name</p>
			<p>Game Mode</p>
			<p>Release Date</p>
		</div>
	{/if}
	<div class="custom-grid gap-4">
		{#each guesses as guess (guess.name)}
			{@const fadeDuration = 500}
			<img
				in:fade={{ duration: fadeDuration }}
				class="w-full rounded"
				src={guess.thumbnail}
				alt={guess.name}
			/>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration }}
				class={`${
					guess.correct ? 'bg-green-500' : 'bg-red-500'
				} flex items-center justify-center gap-2 rounded-sm`}
			>
				{guess.name}
			</p>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 2 }}
				class={`${
					guess.gameModes.correct === 'correct'
						? 'bg-green-500'
						: guess.gameModes.correct === 'partial'
							? 'bg-orange-500'
							: 'bg-red-500'
				} flex items-center justify-center text-center gap-2 rounded-sm`}
			>
				{guess.gameModes.value.join(', ')}
			</p>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 3 }}
				class={`${
					guess.releaseDate.correct === 'correct' ? 'bg-green-500' : 'bg-red-500'
				} flex items-center justify-center gap-2 rounded-sm`}
			>
				{guess.releaseDate.value}
				<ChevronDown class={guess.releaseDate.correct === 'earlier' ? '' : 'hidden'} />
				<ChevronUp class={guess.releaseDate.correct === 'later' ? '' : 'hidden'} />
			</p>
		{/each}
	</div>
</div>

<style scoped>
	.custom-grid {
		display: grid;
		grid-template-columns: 5rem repeat(3, 1fr);
	}
</style>
