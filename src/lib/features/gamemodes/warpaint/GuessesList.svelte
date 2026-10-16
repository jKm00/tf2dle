<script lang="ts">
	import { CDN_URL } from '#lib/constants.ts';
	import type { WarpaintGuessResponse } from './types.ts';

	let { guesses }: { guesses: WarpaintGuessResponse[] } = $props();
</script>

{#if guesses.length > 0}
	<section class="grid gap-4" aria-label="Guesses">
		<h2 class="text-sm font-semibold">Guesses</h2>
		<div class="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 text-sm font-semibold">
			<p>Image</p>
			<p>Name / collection</p>
		</div>
		<ol class="grid gap-4">
			{#each guesses as guess, index (`${guess.guessedAt}:${index}`)}
				<li class="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 text-sm">
					<div class="size-20 overflow-hidden rounded-sm bg-muted/20">
						<img
							src="{CDN_URL}/warpaints/{guess.thumbnail}.png"
							alt={guess.name}
							width="80"
							height="80"
							loading="lazy"
							class="size-full object-contain"
						/>
					</div>
					<div
						class="grid min-w-0 content-center gap-1 rounded-sm p-3 text-center {guess.correct
							? 'bg-correct text-correct-foreground'
							: 'bg-incorrect text-incorrect-foreground'}"
					>
						<p class="font-medium">
							{guess.name} <span class="sr-only">{guess.correct ? 'Correct' : 'Incorrect'}</span>
						</p>
						{#if guess.feedback}<p>{guess.feedback}</p>{/if}
					</div>
				</li>
			{/each}
		</ol>
	</section>
{/if}
