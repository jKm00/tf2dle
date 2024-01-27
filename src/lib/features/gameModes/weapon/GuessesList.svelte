<script lang="ts">
	import type { WeaponGuessResponse } from '$lib/dtos';
	import { fade } from 'svelte/transition';

	export let guesses: WeaponGuessResponse[];
</script>

<div class="grid gap-4 text-center">
	{#if guesses.length > 0}
		<div class="grid grid-cols-6 gap-2 items-center font-semibold" data-testId="guess-row-title">
			<p>Image</p>
			<p>Release Date</p>
			<p>Used By</p>
			<p>Slot</p>
			<p>Magasin size</p>
			<p>Qualitites</p>
		</div>
	{/if}
	{#each guesses as guess}
		{@const fadeDuration = 500}
		<div class="grid grid-cols-6 gap-2 items-center">
			<img
				in:fade={{ duration: fadeDuration }}
				src={`/images/weapons/thumbnails/${guess.name}.png`}
				alt={guess.name}
				class="w-20"
			/>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration }}
				class={`border h-full rounded-sm flex items-center justify-center gap-2 ${guess.releaseDate.status}`}
			>
				{guess.releaseDate.value}
			</p>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 2 }}
				class={`border h-full rounded-sm flex items-center justify-center gap-2 ${guess.usedBy.status}`}
			>
				{guess.usedBy.value.join(', ')}
			</p>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 3 }}
				class={`border h-full rounded-sm flex items-center justify-center gap-2 ${guess.slot.status}`}
			>
				{guess.slot.value.join(', ')}
			</p>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 4 }}
				class={`border h-full rounded-sm flex items-center justify-center gap-2 ${guess.magazineSize.status}`}
			>
				{guess.magazineSize.value}
			</p>
			<p
				in:fade={{ duration: fadeDuration, delay: fadeDuration * 5 }}
				class={`border h-full rounded-sm flex items-center justify-center gap-2 ${guess.qualities.status}`}
			>
				{guess.qualities.value.join(', ')}
			</p>
		</div>
	{/each}
</div>

<style scoped>
	.incorrect,
	.earlier,
	.later {
		border-color: hsl(var(--incorrect));
	}

	.partial {
		border-color: hsl(var(--partial));
	}

	.correct {
		border-color: hsl(var(--correct));
	}
</style>
