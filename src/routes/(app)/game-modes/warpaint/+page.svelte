<script lang="ts">
	import { writable } from 'svelte/store';
	import GameShell from '#lib/components/games/GameShell.svelte';
	import Input from '#lib/components/games/Input.svelte';
	import CommunityStatus from '#lib/components/games/CommunityStatus.svelte';
	import CompletedResult from '#lib/components/games/CompletedResult.svelte';
	import YesterdayAnswer from '#lib/components/games/YesterdayAnswer.svelte';
	import { useGameEngine } from '#lib/composables/useGameEngine.ts';
	import { CDN_URL } from '#lib/constants.ts';
	import ImageShowcase from '#lib/features/gamemodes/warpaint/ImageShowcase.svelte';
	import GuessesList from '#lib/features/gamemodes/warpaint/GuessesList.svelte';
	import Hints from '#lib/features/gamemodes/warpaint/Hints.svelte';
	import {
		WARPAINT_HINTS,
		type WarpaintGuessResponse
	} from '#lib/features/gamemodes/warpaint/types.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const numberOfCorrectGuesses = writable<number | undefined>(0);
	const { gameState, guesses, streak, stats, validating, openVictoryDialog, handleGuess } =
		useGameEngine<WarpaintGuessResponse>('warpaint', 0, numberOfCorrectGuesses);
	let actionError = $state<string | null>(null);
	let pendingGuess = $state<string | null>(null);
	let latest = $derived($guesses[0]);
	let hasWon = $derived($gameState === 'won' || latest?.correct === true);
	let guessedNames = $derived($guesses.map((guess) => guess.name));
	let clues = $derived({
		shortlist: $guesses.length >= WARPAINT_HINTS.shortlist ? latest?.shortlist : undefined,
		collection: $guesses.length >= WARPAINT_HINTS.collection ? latest?.collection : undefined
	});
	let loadingState = $derived<'success' | 'error'>(
		data.todaysWarpaint && data.warpaints ? 'success' : 'error'
	);

	$effect(() => {
		if (data.todaysWarpaint) numberOfCorrectGuesses.set(data.todaysWarpaint.numberOfCorrectGuesses);
	});

	async function guess(value: string) {
		actionError = null;
		pendingGuess = value;
		try {
			const result = await handleGuess(value);
			if (!result) actionError = 'Your guess was not saved. Please try again.';
			return !!result;
		} finally {
			pendingGuess = null;
		}
	}
</script>

<GameShell
	title="Warpaint"
	challenge="Warpaint"
	shareMode="warpaint"
	description="Identify today's warpaint from expanding image clues"
	img={{ basePath: `${CDN_URL}/warpaints/`, guessKey: 'thumbnail' }}
	{loadingState}
	{guesses}
	{streak}
	{stats}
	{numberOfCorrectGuesses}
	{openVictoryDialog}
>
	<div class="grid gap-4">
		{#if data.todaysWarpaint}
			<ImageShowcase {...data.todaysWarpaint.warpaint} guesses={$guesses.length} {hasWon} />
		{/if}
		<Hints
			guesses={$guesses.length}
			{clues}
			{guessedNames}
			{hasWon}
			validating={$validating}
			{pendingGuess}
			onselect={guess}
		/>
		{#if !hasWon}
			<CommunityStatus challenge="warpaint" correctGuesses={$numberOfCorrectGuesses} />
			{#if !clues.shortlist}
				<Input
					data={data.warpaints?.map(({ name, thumbnail }) => ({
						value: name,
						img: `${CDN_URL}/warpaints/${thumbnail}.png`
					}))}
					imageSize={4}
					guessed={guessedNames}
					validating={$validating}
					onselect={guess}
				/>
			{/if}
			{#if actionError}<p role="alert" class="text-sm text-destructive">{actionError}</p>{/if}
		{:else}
			<CompletedResult
				mode="warpaint"
				challenge="warpaint"
				guesses={$guesses}
				streak={$streak}
				correctGuesses={$numberOfCorrectGuesses}
			/>
		{/if}
		<GuessesList guesses={$guesses} />
	</div>
	{#snippet footer()}
		<div class="flex justify-center w-full">
			{#await data.yesterdaysAnswer then answer}
				{#if answer}<YesterdayAnswer challenge="warpaint" {answer} />{/if}
			{/await}
		</div>
	{/snippet}
</GameShell>
