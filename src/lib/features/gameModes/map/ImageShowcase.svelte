<script lang="ts">
	import { onMount } from 'svelte';

	export let url: string;
	export let startingPos: { x: number; y: number };
	export let numberOfGuesses: number;
	export let hasWon: boolean;

	const STEPS = 10;

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let canvasWidth: number;
	let canvasHeight: number;
	let img: HTMLImageElement;

	$: diffX = 50 - startingPos.x;
	$: diffY = 50 - startingPos.y;

	$: stepCounterX = diffX / (STEPS - 1);
	$: stepCounterY = diffY / (STEPS - 1);

	let currentPos =
		numberOfGuesses < STEPS
			? {
					x: startingPos.x + stepCounterX * numberOfGuesses,
					y: startingPos.y + stepCounterY * numberOfGuesses
				}
			: {
					x: 50,
					y: 50
				};

	$: if (numberOfGuesses < STEPS) {
		currentPos = hasWon
			? { x: 50, y: 50 }
			: {
					x: startingPos.x + stepCounterX * numberOfGuesses,
					y: startingPos.y + stepCounterY * numberOfGuesses
				};
	}

	$: zoom = !hasWon && numberOfGuesses < STEPS ? STEPS - numberOfGuesses : 1;

	$: if (img && zoom) {
		drawImage(img, zoom);
	}

	onMount(() => {
		handleWindowResize();

		img = new Image();
		img.src = url;
		img.onload = () => drawImage(img, zoom);
	});

	function handleWindowResize() {
		const { width, height } = container.getBoundingClientRect();
		canvasWidth = width;
		canvasHeight = height;
	}

	function drawImage(img: HTMLImageElement, zoom: number) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		const scaledWidth = canvasWidth * zoom;
		const scaledHeight = canvasHeight * zoom;

		const dx = (canvasWidth - scaledWidth) / 2;
		const dy = (canvasHeight - scaledHeight) / 2;

		ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);
	}
</script>

<svelte:window on:resize={handleWindowResize} />

<div class="relative overflow-hidden aspect-video rounded" bind:this={container}>
	<div class="absolute inset-0 bg-muted animate-pulse"></div>
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<canvas
		class="w-full h-full absolute"
		width={canvasWidth}
		height={canvasHeight}
		bind:this={canvas}
	></canvas>
	<!-- <img
		src={url}
		alt="Image of today's map"
		class="absolute"
		style={`--zoom: ${zoom}; --x: ${currentPos.x}%; --y: ${currentPos.y}%;`}
	/> -->
</div>

<style scoped>
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		top: var(--y);
		left: var(--x);
		transform: translate(-50%, -50%) scale(var(--zoom));
	}
</style>
