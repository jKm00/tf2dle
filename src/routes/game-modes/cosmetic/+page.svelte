<script lang="ts">
	import Input from '$lib/components/games/Input.svelte';
	import * as Card from '$lib/components/ui/card';
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import dayjs from '$lib/configs/dayjsConfig.js';
	import type { CosmeticDto, CosmeticGuessResponse } from '$lib/dtos.js';
	import { Dices, Flame, Loader2, RotateCw } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	export let data;

	let guesses = useLocalStorage<CosmeticGuessResponse[]>('cosmetic_guesses', []);
	let lastEvent = useLocalStorage<{ event: string; date: string } | null>(
		'cosmetic_last_event',
		null
	);
	let streak = useLocalStorage('cosmetic_streak', 0);

	let loadingState: 'loading' | 'error' | 'success' = 'loading';
	let gameState: 'guessing' | 'won' = 'guessing';
	let validating = false;

	let cosmetics: CosmeticDto[] = [];
	let numberOfCorrectGuesses: number | null = null;

	onMount(async () => {
		// Fetch data
		try {
			const [res1] = await Promise.all([data.cosmetics]);
			cosmetics = res1 ?? [];
		} catch (err) {
			loadingState = 'error';
			return;
		}

		// Init game state
		if ($lastEvent === null) {
			guesses.set([]);
			streak.set(0);
			gameState = 'guessing';
		} else {
			switch ($lastEvent.event) {
				case 'won':
					if (dayjs($lastEvent.date).isSame(dayjs.utc(), 'date')) {
						gameState = 'won';
					} else {
						gameState = 'guessing';
						guesses.set([]);
					}
					break;
				case 'guessed':
					gameState = 'guessing';
					if (!dayjs($lastEvent.date).isSame(dayjs.utc(), 'date')) {
						guesses.set([]);
					}
					break;
			}
		}

		loadingState = 'success';
	});

	async function handleSelect(name: string) {
		if (gameState === 'won') return;

		const result = await checkGuess(name);

		if (result) {
			guesses.update((guesses) => [result, ...guesses]);

			if (result.correct) {
				won();
			}
		}
	}

	async function checkGuess(guess: string) {
		validating = true;
		let error = false;

		try {
			const res = await fetch('/api/v1/game-modes/cosmetic', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ guess })
			});
			const data = (await res.json()) as CosmeticGuessResponse;

			if (!res.ok) {
				error = true;
			} else {
				return data;
			}
		} catch (err) {
			error = true;
		} finally {
			validating = false;
		}

		if (error) {
			toast.error('Could not validate your guess, please try again.');
		}
	}

	function won() {
		setTimeout(() => {
			gameState = 'won';
		}, 1000);
	}
</script>

<div>
	<Card.Root>
		<Card.Header>
			<div class="flex justify-between">
				<div>
					<Card.Title>Cosmetic</Card.Title>
					<Card.Description>Guess today's cosmetic</Card.Description>
				</div>
				<div class="flex gap-4">
					<p class="flex items-center">
						<Dices aria-label="Number of guesses" />
						2
					</p>
					<p class="flex items-center">
						<Flame aria-label="streak" />
						0
					</p>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			{#if loadingState === 'loading'}
				<div class="flex justify-center p-4">
					<Loader2 class="h-4 w-4 animate-spin" />
				</div>
			{:else if loadingState === 'error'}
				<a href="/game-modes/cosmetic" class="grid justify-items-center gap-4 p-4">
					Something went wrong. Please try to refresh.
					<RotateCw class="w-4 h-4" />
				</a>
			{:else if gameState === 'guessing'}
				<p class="text-center text-sm text-muted-foreground">
					{numberOfCorrectGuesses}
					{numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} have guessed todays cosmetic
				</p>
				<Input
					data={cosmetics?.map((c) => ({
						img: `/images/cosmetics/${c.thumbnail}.png`,
						value: c.name
					}))}
					guessed={$guesses.map((guess) => guess.name)}
					{validating}
					on:select={(e) => handleSelect(e.detail)}
				/>
			{:else}
				<p class="text-center text-sm text-muted-foreground my-10" data-testId="completed-message">
					You are 1 out of {numberOfCorrectGuesses} that have guessed todays cosmetic!
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
