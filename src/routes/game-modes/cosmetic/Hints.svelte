<script lang="ts">
	import { Glasses, RefreshCcwDot, Sparkle } from 'lucide-svelte';

	export let guesses: number;
	export let usedBy: string | undefined;

	const ROTATION_HINT = 5;
	const GRAYSCALE_HINT = 10;
	const CLASS_HINT = 15;
</script>

<div>
	<div class="grid grid-cols-3 justify-items-center text-center text-xs">
		<div
			class={`flex flex-col gap-2 items-center max-w-24 ${
				guesses < ROTATION_HINT ? 'text-muted-foreground' : ''
			}`}
		>
			<RefreshCcwDot />
			<p>Correct rotation in {Math.max(ROTATION_HINT - guesses, 0)} tries</p>
		</div>
		<div
			class={`flex flex-col gap-2 items-center max-w-24 ${
				guesses < GRAYSCALE_HINT ? 'text-muted-foreground' : ''
			}`}
		>
			<Sparkle />
			<p>Remove gray filter in {Math.max(GRAYSCALE_HINT - guesses, 0)} tries</p>
		</div>
		<div
			class={`flex flex-col gap-2 items-center max-w-24 ${
				guesses < CLASS_HINT ? 'text-muted-foreground' : ''
			}`}
		>
			<Glasses />
			{#if guesses >= CLASS_HINT && usedBy}
				<p class="flex flex-col">Used by: <span>{usedBy}</span></p>
			{:else}
				<p>Class clue in {Math.max(CLASS_HINT - guesses, 0)} tries</p>
			{/if}
		</div>
	</div>
</div>
