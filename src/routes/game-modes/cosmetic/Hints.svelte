<script lang="ts">
	import { Glasses, RefreshCcwDot, Sparkles } from 'lucide-svelte';

	// The number of guesses the user has made
	export let guesses: number;
	// The class the cosmetic is used by (Scout, Soldier, etc.)
	export let usedBy: string | null;

	const ROTATION_HINT = 3;
	const GRAYSCALE_HINT = 6;
	const CLASS_HINT = 9;
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
			<Sparkles />
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
