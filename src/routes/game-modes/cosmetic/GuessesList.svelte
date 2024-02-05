<script lang="ts">
	import type { CosmeticGuessResponse } from '$lib/dtos';
	import { scale } from 'svelte/transition';

	export let guesses: CosmeticGuessResponse[];
</script>

<div class="grid gap-2">
	{#each guesses as guess (guess.name)}
		<div
			in:scale={{ duration: 500, start: 0.5 }}
			class="flex items-center justify-center border rounded-sm py-2 {guess.correct
				? 'border-correct'
				: 'border-incorrect'}"
		>
			<img src={`/images/cosmetics/${guess.thumbnail}.png`} alt={guess.name} />
			<p class="text-sm">{guess.name}</p>
		</div>
	{/each}
</div>
