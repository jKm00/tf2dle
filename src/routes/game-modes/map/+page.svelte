<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from './Input.svelte';

	const steps = 20;

	export let data;

	let gameState: 'guessing' | 'finished';
	let lastFinish = useLocalStorage<string>('map-last-finish', '');
	let guesses = useLocalStorage<string[]>('map-guesses', []);

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
		}
	});

	function handleSelect(name: string) {
		guesses.update((guesses) => [...guesses, name]);

		if (checkGuess(name)) {
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

<div class="grid gap-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Map</Card.Title>
			<Card.Description>Guess today's map</Card.Description>
		</Card.Header>
		<Card.Content>
			<div>
				<div class="relative overflow-hidden aspect-video rounded mb-4">
					<img
						src={map.image.url}
						alt=""
						class="absolute"
						style={`--zoom: ${zoom}; --x: ${pos.x}%; --y: ${pos.x}%;`}
					/>
				</div>
				<Input on:select={(event) => handleSelect(event.detail)} />
			</div>
		</Card.Content>
	</Card.Root>
</div>

<style scoped>
	img {
		top: var(--y);
		left: var(--x);
		transform: translate(-50%, -50%) scale(var(--zoom));
	}
</style>
