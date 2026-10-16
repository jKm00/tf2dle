<script lang="ts">
	import Button from '#lib/components/ui/button/button.svelte';
	import { Glasses, ListFilter } from '@lucide/svelte';
	import { WARPAINT_HINTS, type WarpaintClues } from './types.ts';

	let {
		guesses,
		clues,
		guessedNames,
		hasWon,
		validating,
		pendingGuess,
		onselect
	}: {
		guesses: number;
		clues?: WarpaintClues;
		guessedNames: string[];
		hasWon: boolean;
		validating: boolean;
		pendingGuess: string | null;
		onselect: (value: string) => unknown;
	} = $props();

	let shortlistElement = $state.raw<HTMLElement>();

	$effect(() => {
		shortlistElement?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
	});
</script>

<section class="grid gap-3" aria-label="Hints">
	<div class="grid grid-cols-2 gap-2">
		<div
			class="rounded-lg border p-3 text-center text-xs {guesses >= WARPAINT_HINTS.shortlist ||
			hasWon
				? 'border-primary/30 bg-primary/10'
				: 'border-border/70 bg-muted/20 text-muted-foreground'}"
		>
			<ListFilter class="mx-auto mb-2 size-5" aria-hidden="true" />
			<h2 class="font-medium text-foreground">Six choices</h2>
			<p aria-live="polite">
				{#if guesses >= WARPAINT_HINTS.shortlist || hasWon}Shortlist unlocked
				{:else}Unlocks in {WARPAINT_HINTS.shortlist - guesses}
					{WARPAINT_HINTS.shortlist - guesses === 1 ? 'guess' : 'guesses'}{/if}
			</p>
		</div>
		<div
			class="rounded-lg border p-3 text-center text-xs {guesses >= WARPAINT_HINTS.collection ||
			hasWon
				? 'border-primary/30 bg-primary/10'
				: 'border-border/70 bg-muted/20 text-muted-foreground'}"
		>
			<Glasses class="mx-auto mb-2 size-5" aria-hidden="true" />
			<h2 class="font-medium text-foreground">Collection hint</h2>
			<p aria-live="polite">
				{#if guesses >= WARPAINT_HINTS.collection && clues?.collection}<span
						class="font-semibold text-foreground">{clues.collection}</span
					>
				{:else if hasWon}Solved before this hint
				{:else}Unlocks in {WARPAINT_HINTS.collection - guesses}
					{WARPAINT_HINTS.collection - guesses === 1 ? 'guess' : 'guesses'}{/if}
			</p>
		</div>
	</div>
	{#if clues?.shortlist && !hasWon}
		<section
			bind:this={shortlistElement}
			class="grid gap-2 rounded-lg border border-border/70 bg-muted/20 p-3"
			aria-label="Name shortlist"
		>
			<h2 class="text-sm font-semibold">One of these six warpaints</h2>
			<ul class="grid gap-2 sm:grid-cols-2">
				{#each clues.shortlist as option (option.name)}
					<li>
						<Button
							variant="outline"
							class="h-auto min-h-10 w-full whitespace-normal justify-start text-left"
							disabled={option.ruledOut || guessedNames.includes(option.name) || validating}
							aria-busy={validating && pendingGuess === option.name}
							onclick={() => onselect(option.name)}
						>
							<span class={option.ruledOut ? 'line-through' : ''}>{option.name}</span>
							{#if validating && pendingGuess === option.name}<span class="ml-auto text-xs"
									>Checking…</span
								>{/if}
							{#if option.ruledOut}<span class="sr-only">Different collection, ruled out</span>
							{:else if guessedNames.includes(option.name)}<span class="sr-only"
									>Already guessed</span
								>{/if}
						</Button>
					</li>
				{/each}
			</ul>
			{#if clues.collection}<p class="text-xs text-muted-foreground">
					Crossed-out names belong to a different collection.
				</p>{/if}
		</section>
	{/if}
</section>
