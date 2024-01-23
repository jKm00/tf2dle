<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '../../../lib/components/features/gameModes/map/Input.svelte';
	import ImageShowcase from '$lib/components/features/gameModes/map/ImageShowcase.svelte';

	export let data;

	$: ({ todaysMap, maps } = data);

	let gameState: 'guessing' | 'won';
	let lastEvent = useLocalStorage<{ event: 'won' | 'guessed'; date: string } | null>(
		'map-last-event',
		null
	);
	let guesses = useLocalStorage<string[]>('map-guesses', []);

	onMount(() => {
		if ($lastEvent === null) {
			gameState = 'guessing';
			return;
		}

		switch ($lastEvent.event) {
			case 'won':
				if ($lastEvent.date === new Date().toDateString()) {
					gameState = 'won';
				} else {
					gameState = 'guessing';
					guesses.set([]);
				}
				break;
			case 'guessed':
				gameState = 'guessing';
				if ($lastEvent.date !== new Date().toDateString()) {
					guesses.set([]);
				}
				break;
		}
	});

	function handleSelect(name: string) {
		guesses.update((guesses) => [...guesses, name]);
		lastEvent.set({ event: 'guessed', date: new Date().toDateString() });

		if (checkGuess(name)) {
			won();
		}
	}

	function checkGuess(value: string) {
		return value.toLowerCase() === 'frosty';
	}

	function won() {
		gameState = 'won';
		lastEvent.set({ event: 'won', date: new Date().toDateString() });
	}
</script>

<div class="grid gap-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Map</Card.Title>
			<Card.Description>Guess today's map</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				{#if todaysMap}
					<ImageShowcase
						url={todaysMap.image.url}
						startingPos={todaysMap.image.startingPos}
						numberOfGuesses={$guesses.length}
						hasWon={gameState === 'won'}
					/>
					{#if gameState !== 'won'}
						<Input
							on:select={(event) => handleSelect(event.detail)}
							{maps}
							guessedMaps={$guesses}
						/>
					{/if}
					<ul>
						{#each $guesses as guess}
							<li>{guess}</li>
						{/each}
					</ul>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>
