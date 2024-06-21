<script lang="ts">
	import { Glasses, RefreshCcwDot, Sparkles } from 'lucide-svelte';

	export let guesses: number;
	export let series: string | null = null;

	const ROTATION_HINT = 3;
	const GRAYSCALE_HINT = 6;
	const SERIES_HINT = 9;
</script>

<div>
	<div class="grid grid-cols-3 justify-items-center text-center text-xs">
		<div
			class="flex flex-col gap-2 items-center max-w-24 {guesses < ROTATION_HINT
				? 'text-muted-foreground'
				: ''}"
		>
			<RefreshCcwDot />
			<p>Correct roration in {Math.max(ROTATION_HINT - guesses, 0)} tries</p>
		</div>
		<div
			class={`flex flex-col gap-2 items-center max-w-24 ${
				guesses < GRAYSCALE_HINT ? 'text-muted-foreground' : ''
			}`}
		>
			<Sparkles />
			<p>Remove gray filter in {Math.max(GRAYSCALE_HINT - guesses, 0)} tries</p>
		</div>
		<div
			class={`flex flex-col gap-2 items-center max-w-24 ${
				guesses < SERIES_HINT ? 'text-muted-foreground' : ''
			}`}
		>
			<Glasses />
			{#if guesses >= SERIES_HINT && series}
				<p class="flex flex-col">Used by: <span>{series}</span></p>
			{:else}
				<p>Series clue in {Math.max(SERIES_HINT - guesses, 0)} tries</p>
			{/if}
		</div>
	</div>
</div>
