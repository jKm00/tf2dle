<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Loader2, RotateCw } from 'lucide-svelte';
	import Input from '$lib/components/games/Input.svelte';
	import { onMount } from 'svelte';
	import dayjs from '$lib/configs/dayjsConfig.js';
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import type { WeaponGuessResponse } from '$lib/dtos.js';
	import { toast } from 'svelte-sonner';
	import GuessesList from '$lib/features/gameModes/weapon/GuessesList.svelte';
	import VictoryDialog from '$lib/components/games/VictoryDialog.svelte';
	import ColorExplanation from '$lib/components/games/ColorExplanation.svelte';

	export let data;

	let gameState: 'guessing' | 'won';
	let guesses = useLocalStorage<WeaponGuessResponse[]>('weapon_guesses', []);
	let lastEvent = useLocalStorage<{ event: string; date: string } | null>(
		'weapon_last_event',
		null
	);
	let streak = useLocalStorage('weapon__streak', 0);

	let openDialog = false;

	onMount(() => {
		if ($lastEvent === null) {
			guesses.set([]);
			streak.set(0);
			gameState = 'guessing';
			return;
		}

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
	});

	async function handleGuess(guess: string) {
		if (gameState === 'won') return;

		lastEvent.set({ event: 'guessed', date: dayjs.utc().format() });

		const result = await checkGuess(guess);

		if (result) {
			guesses.set([result, ...$guesses]);
		}

		if (result?.correct) {
			won();
		}
	}

	async function checkGuess(guess: string) {
		let error = false;

		try {
			const res = await fetch('/api/v1/game-modes/weapon', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ guess })
			});
			const data = (await res.json()) as WeaponGuessResponse;

			console.log(data);

			if (!res.ok) {
				error = true;
			} else {
				return data;
			}
		} catch (err) {
			error = true;
		}
		toast.error('Could not validate your guess, please try again.');
	}

	function won() {
		// Wait for reveal animation to finish
		setTimeout(() => {
			lastEvent.set({ event: 'won', date: dayjs.utc().format() });
			streak.update((streak) => streak + 1);
			gameState = 'won';
			openDialog = true;
		}, 500 * 6);
	}
</script>

<div class="grid gap-4">
	<Card.Root>
		<Card.Header>
			<Card.Title data-testId="title">Weapon</Card.Title>
			<Card.Description>Guess today's weapon</Card.Description>
		</Card.Header>
		<Card.Content>
			{#await data.weapons}
				<div class="flex justify-center p-4">
					<Loader2 class="h-4 w-4 animate-spin" />
				</div>
			{:then weapons}
				<div class="grid gap-4">
					{#if gameState === 'guessing'}
						<Input
							data={weapons?.map((weapon) => ({
								img: `/images/weapons/thumbnails/${weapon}.png`,
								value: weapon
							}))}
							guessed={$guesses.map((guess) => guess.name)}
							on:select={(e) => handleGuess(e.detail)}
						/>
					{:else}
						<p class="text-center my-10">You have already guessed todays weapon!</p>
					{/if}
					<GuessesList guesses={$guesses} />
				</div>
			{:catch error}
				<a
					href="/game-modes/weapon"
					class="grid justify-items-center gap-4 p-4"
					data-testId="refresh"
				>
					{error.body.message}
					<RotateCw class="w-4 h-4" />
				</a>
			{/await}
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	{#if $guesses.length > 0}
		<VictoryDialog
			img={{ src: `/images/weapons/thumbnails/${$guesses[0].name}.png`, alt: $guesses[0].name }}
			imgSize="10rem"
			label="Weapon"
			value={$guesses[0].name}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={0}
			challenge="weapon"
			bind:open={openDialog}
		/>
	{/if}
</div>