<script lang="ts">
	import { CDN_URL } from '#lib/constants.ts';
	import type { WarpaintComparison, WarpaintGuessResponse } from './types.ts';

	let { guesses }: { guesses: WarpaintGuessResponse[] } = $props();

	const statusClasses: Record<WarpaintComparison['status'], string> = {
		correct: 'bg-correct text-correct-foreground',
		incorrect: 'bg-incorrect text-incorrect-foreground',
		partial: 'bg-partial text-partial-foreground'
	};
	const statusLabels = { correct: 'Correct', incorrect: 'Incorrect', partial: 'Partial match' };
</script>

{#if guesses.length > 0}
	<section class="grid min-w-0 gap-2" aria-label="Guesses">
		<h2 class="text-sm font-semibold">Guesses</h2>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need focus to scroll the comparison table.) -->
		<div
			class="overflow-x-auto pb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
			role="region"
			aria-label="Warpaint guess comparisons"
			tabindex="0"
		>
			<table
				class="w-full min-w-[34rem] table-fixed border-separate border-spacing-x-2 border-spacing-y-3 text-center text-sm"
				aria-label="Warpaint guesses"
			>
				<colgroup>
					<col class="w-20" />
					<col class="w-[30%]" />
					<col />
					<col class="w-[18%]" />
				</colgroup>
				<thead>
					<tr>
						<th scope="col" class="font-semibold">Image</th>
						<th scope="col" class="font-semibold">Name</th>
						<th scope="col" class="font-semibold">Collection</th>
						<th scope="col" class="font-semibold">Grade</th>
					</tr>
				</thead>
				<tbody>
					{#each guesses as guess (guess.name)}
						<tr>
							<td class="p-0 align-middle">
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
							</td>
							<td
								class="relative h-20 break-words rounded-sm p-2 align-middle font-medium {statusClasses[
									guess.correct ? 'correct' : 'incorrect'
								]}"
							>
								{guess.name}<span class="sr-only">. {guess.correct ? 'Correct' : 'Incorrect'}</span>
							</td>
							{#each [guess.feedback.collection, guess.feedback.grade] as comparison}
								<td
									class="relative h-20 break-words rounded-sm p-2 align-middle {statusClasses[
										comparison.status
									]}"
								>
									{comparison.value}<span class="sr-only">. {statusLabels[comparison.status]}</span>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="text-xs text-muted-foreground sm:hidden">Scroll horizontally to see all columns.</p>
	</section>
{/if}
