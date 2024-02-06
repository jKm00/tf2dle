<script lang="ts">
	import type { WeaponGuessResponse } from '$lib/dtos';
	import { ArrowBigDown, ArrowBigUp, MoveLeft, MoveRight } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	// The guesses the user has made
	export let guesses: WeaponGuessResponse[];
</script>

<div class="overflow-x-auto pb-2">
	<div class="grid gap-4 text-center min-w-[600px]">
		{#if guesses.length > 0}
			<div class="grid grid-cols-6 gap-2 items-center font-semibold" data-testId="guess-row-title">
				<p>Image</p>
				<p>Used By</p>
				<p>Slot</p>
				<p>Magazine size</p>
				<p>Release Year</p>
				<p>Qualities</p>
			</div>
		{/if}
		<div class="grid grid-cols-6 gap-2 items-center text-sm">
			{#each guesses as guess (guess.name)}
				{@const fadeDuration = 500}
				<img
					in:fade={{ duration: fadeDuration }}
					src={`/images/weapons/thumbnails/${guess.name}.png`}
					alt={guess.name}
					class="w-20"
				/>
				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 1 }}
					class={`border p-2 h-full rounded-sm flex items-center justify-center gap-2 ${guess.usedBy.status}`}
				>
					{guess.usedBy.value.join(', ')}
				</p>
				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 2 }}
					class={`border p-2 h-full rounded-sm flex items-center justify-center gap-2 ${guess.slot.status}`}
				>
					{guess.slot.value.join(', ')}
				</p>
				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 3 }}
					class={`border p-2 h-full rounded-sm flex items-center justify-center gap-2 ${guess.magazineSize.status}`}
				>
					{guess.magazineSize.value}
				</p>
				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 5 }}
					class={`border p-2 h-full rounded-sm flex items-center justify-center gap-2 ${guess.releaseDate.status}`}
				>
					{guess.releaseDate.value}
					<ArrowBigDown class={guess.releaseDate.status === 'earlier' ? '' : 'hidden'} />
					<ArrowBigUp class={guess.releaseDate.status === 'later' ? '' : 'hidden'} />
				</p>

				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 5 }}
					class={`border p-2 h-full rounded-sm flex items-center justify-center gap-2 ${guess.qualities.status}`}
				>
					{guess.qualities.value.join(', ')}
				</p>
			{/each}
		</div>
	</div>
</div>
<p
	class="scroll-guide flex items-center justify-center gap-2 text-center text-sm text-muted-foreground mt-2"
>
	<MoveLeft class="w-4" /> Scroll horizontally to see more <MoveRight class="w-4" />
</p>

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

	@media (min-width: 666px) {
		.scroll-guide {
			display: none;
		}
	}
</style>
