<script lang="ts">
	import Input from '$lib/components/games/Input.svelte';
	import { useLocalStorage } from '$lib/composables/useLocalStorage.js';
	import type { WeaponTwoGuessResponse, WeaponTwoResponse } from '$lib/dtos.js';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { AreaChart, Dices, Flame, Loader2, RotateCw } from 'lucide-svelte';
	import GuessesList from './GuessesList.svelte';
	import ColorExplanation from '$lib/components/games/ColorExplanation.svelte';
	import StatsDialog from '$lib/components/games/StatsDialog.svelte';
	import VictoryDialog from '$lib/components/games/VictoryDialog.svelte';
	import { GameState, useGameEngine } from '$lib/composables/useGameEngine2';

	export let data;

	let openStatsDialog = false;
	let openVictoryDialog = false;

	let todaysWeapon: WeaponTwoResponse | undefined;

	let clues = useLocalStorage<{ text: string; variant: 'positive' | 'negative' | 'neutral' }[]>(
		'weapon_2_clues',
		[]
	);
	let correctWeapon = useLocalStorage<string | null>('weapon_2_answer', null);

	$: numberOfCorrectGuesses = todaysWeapon?.numberOfCorrectGuesses ?? 0;
	$: numberOfTotalAttributes = todaysWeapon?.weapon.numberOfTotalAttributes ?? 0;
	$: hiddenClues = numberOfTotalAttributes > 0 ? numberOfTotalAttributes - $clues.length : 0;

	const { state, stats, guesses, streak, validating, init, guess } =
		useGameEngine<WeaponTwoGuessResponse>({
			name: 'weapon_2',
			apiRoute: 'weapon-2',
			victoryMessageDelay: 500,
			onReset,
			onGuess,
			onWon
		});

	onMount(async () => {
		const [res1, _] = await Promise.all([data.todaysWeapon, data.weapons]);

		todaysWeapon = res1;

		init();
	});

	function onReset() {
		clues.set(todaysWeapon?.weapon.attributes ?? []);
		correctWeapon.set(null);
	}

	function onGuess(response: WeaponTwoGuessResponse) {
		clues.set(response.attributes);
	}

	function onWon(result: WeaponTwoGuessResponse) {
		numberOfCorrectGuesses = numberOfCorrectGuesses ? numberOfCorrectGuesses + 1 : 1;
		clues.set(result.attributes);
		correctWeapon.set(result.name);
		openVictoryDialog = true;
	}
</script>

<div class="grid gap-4">
	<Card.Root>
		<Card.Header>
			<div class="flex justify-between">
				<div>
					<Card.Title>Weapon 2</Card.Title>
					<Card.Description>Guess today's weapon based on its attributes</Card.Description>
				</div>
				<div class="flex gap-4">
					<p class="flex items-center"><Dices aria-label="Number of guesses" />{$guesses.length}</p>
					<p class="flex items-center"><Flame aria-label="streak" /> {$streak}</p>
					<button on:click={() => (openStatsDialog = true)}>
						<AreaChart aria-label="Stats" />
					</button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				{#await data.todaysWeapon}
					<div class="flex justify-center p-4">
						<Loader2 class="w-4 h-4 animate-spin" />
					</div>
				{:then todaysWeapon}
					{#if todaysWeapon}
						<div class="grid gap-4 text-sm justify-items-center mb-8">
							{#if $correctWeapon}
								<img
									src="/images/weapons/thumbnails/{$correctWeapon}.png"
									alt={$correctWeapon}
									class="size-20 object-contain border rounded-md"
								/>
								<h2 class="rounded-md text-lg py-2 px-4">
									{$correctWeapon}
								</h2>
							{:else}
								<div class="size-20 border rounded-md"></div>
								<h2
									class="rounded-md text-lg py-2 px-4 w-[150px] text-muted-foreground text-center"
								>
									???
								</h2>
							{/if}
							<div class="grid gap-1 text-center">
								{#each $clues as clue}
									{@const color =
										clue.variant === 'positive'
											? 'text-positive'
											: clue.variant === 'negative'
												? 'text-negative'
												: 'text-neutral'}
									<p class={color}>{clue.text}</p>
								{/each}
								{#each Array(hiddenClues) as _, index}
									<p class="bg-muted rounded-md text-muted-foreground text-sm py-1 px-2">
										Clue {$clues.length + index + 1}
									</p>
								{/each}
							</div>
						</div>
						{#await data.weapons then weapons}
							{#if $state === GameState.GUESSING}
								<p class="text-sm text-center text-muted-foreground mb-2">
									{numberOfCorrectGuesses}
									{numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} have guessed todays weapon
								</p>
								<Input
									data={weapons?.map((weapon) => ({
										img: `/images/weapons/thumbnails/${weapon}.png`,
										value: weapon
									}))}
									guessed={$guesses.map((guess) => guess.name)}
									on:select={(e) => guess(e.detail)}
									bind:validating={$validating}
								/>
							{:else}
								<p class="text-sm text-center text-muted-foreground">
									You are 1 out of {numberOfCorrectGuesses} that have guessed todays weapon
								</p>
							{/if}
						{/await}
						<GuessesList guesses={$guesses} />
					{/if}
				{:catch error}
					<a
						data-sveltekit-reload
						href="/game-modes/weapon-2"
						class="grid justify-items-center gap-4 p-4"
						data-testId="refresh"
					>
						{error.body.message}
						<RotateCw class="w-4 h-4" />
					</a>
				{/await}
			</div>
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	<StatsDialog bind:open={openStatsDialog} stats={$stats} />

	{#await data.todaysWeapon then todaysWeapon}
		<VictoryDialog
			bind:open={openVictoryDialog}
			img={{
				src: `/images/weapons/thumbnails/${$correctWeapon}.png`,
				alt: $correctWeapon ?? ''
			}}
			imgSize="10rem"
			challenge="Weapon 2"
			value={$correctWeapon ?? ''}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={numberOfCorrectGuesses ?? 1}
			nextChallenge="/game-modes/map"
		/>
	{/await}
</div>
