<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';

	const steps = 20;

	export let data;

	let gameState: 'guessing' | 'finished';
	let lastFinish = useLocalStorage<string>('map-last-finish', '');
	let guesses = useLocalStorage<string[]>('map-guesses', []);

	let input = '';

	let currentStep = steps;

	$: ({ map } = data);

	$: pos = map.image.startingPos;

	$: diffX = 50 - map.image.startingPos.x;
	$: diffY = 50 - map.image.startingPos.y;

	$: stepCounterX = diffX / (steps - 1);
	$: stepCounterY = diffY / (steps - 1);

	$: zoom = currentStep;

	onMount(() => {
		if ($lastFinish === new Date().toDateString()) {
			gameState = 'finished';
		} else {
			gameState = 'guessing';
			guesses.set([]);
		}
	});

	function guess(value: string) {
		if (value === '') return;

		guesses.update((guesses) => [...guesses, value]);
		input = '';

		if (checkGuess(value)) {
			won();
		} else {
			updateImagePos();
		}
	}

	function updateImagePos() {
		if (currentStep === 1) return;

		currentStep = currentStep - 1;

		pos = {
			x: pos.x + stepCounterX,
			y: pos.y + stepCounterY
		};
	}

	function checkGuess(value: string) {
		return value.toLowerCase() === '2fort';
	}

	function won() {
		gameState = 'finished';
		lastFinish.set(new Date().toDateString());
	}
</script>

<section class="grid gap-4">
	<div class="grid gap-4 bg-background p-2 pb-3 rounded">
		<header class="bg-card rounded p-4 text-card-foreground">
			<h2 class="font-bold text-2xl">Map</h2>
			<p>Guess today's map</p>
		</header>
		<div class="relative overflow-hidden aspect-video">
			<img
				src={map.image.url}
				alt=""
				class="absolute"
				style={`--zoom: ${zoom}; --x: ${pos.x}%; --y: ${pos.x}%;`}
			/>
		</div>
		{#if gameState !== 'finished'}
			<form class="flex gap-2" on:submit|preventDefault={() => guess(input)}>
				<Input bind:value={input} placeholder="Enter map name..." class="flex-grow" />
				<Button>Guess</Button>
			</form>
		{/if}
	</div>
	<div class="bg-background p-2 rounded text-foreground">
		<h3 class="font-bold text-lg">Your guesses:</h3>
		{#each $guesses as guess}
			<ul>
				<li>{guess}</li>
			</ul>
		{/each}
	</div>
</section>

<style scoped>
	img {
		top: var(--y);
		left: var(--x);
		transform: translate(-50%, -50%) scale(var(--zoom));
	}
</style>
