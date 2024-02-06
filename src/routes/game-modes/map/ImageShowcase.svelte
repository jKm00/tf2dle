<script lang="ts">
	import { onMount, tick } from 'svelte';

	// The image to display
	export let url: string;
	// Where to start the zoom
	export let startingPos: { x: number; y: number };
	// The number of guesses the user has made
	export let numberOfGuesses: number;
	// Whether the user has won the game
	export let hasWon: boolean;

	const STEPS = 11;

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let img: HTMLImageElement;

	$: drawImage(img, numberOfGuesses, hasWon);

	onMount(async () => {
		// Load and draw image
		img = new Image();
		img.src = url;
		img.onload = async () => {
			handleWindowResize();
			drawImage(img, numberOfGuesses, hasWon);
		};
	});

	/**
	 * Redraw canvas and image when window is resized
	 */
	function handleWindowResize() {
		const { width, height } = container.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;

		drawImage(img, numberOfGuesses, hasWon);
	}

	/**
	 * Draws the image, applying correct zoom based on number of guesses
	 * @param img to draw
	 * @param guesses the user has made
	 * @param hasWon whether the user has won the game
	 */
	function drawImage(img: HTMLImageElement, guesses: number, hasWon: boolean) {
		if (!canvas || !img) return;

		if (guesses >= STEPS) guesses = STEPS - 1;

		const ctx = canvas.getContext('2d');

		if (hasWon) {
			ctx?.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
			return;
		}

		const cropWidth = img.width / (STEPS - guesses);
		const cropHeight = img.height / (STEPS - guesses);

		let sX = startingPos.x - startingPos.x / (STEPS - guesses);
		if (sX < 0) sX = 0;
		if (sX + cropWidth > img.width) sX = img.width - cropWidth;

		let sY = startingPos.y - startingPos.y / (STEPS - guesses);
		if (sY < 0) sY = 0;
		if (sY + cropHeight > img.height) sY = img.height - cropHeight;

		ctx?.drawImage(img, sX, sY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
	}
</script>

<svelte:window on:resize={handleWindowResize} />

<div class="relative overflow-hidden aspect-video rounded" bind:this={container}>
	<div class="absolute inset-0 bg-muted animate-pulse"></div>
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<canvas bind:this={canvas} class="absolute w-full h-full"></canvas>
</div>
