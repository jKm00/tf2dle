<script lang="ts">
	import { onMount } from 'svelte';

	// The cosmetic to display
	export let cosmetic: { thumbnail: string; rotation: number };
	// The number of guesses the user has made
	export let guesses: number;
	// Whether the user has won the game
	export let hasWon: boolean;

	let wrapper: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	let img: HTMLImageElement;

	$: drawImage(img, guesses, hasWon);

	onMount(() => {
		// Load and draw image
		drawCanvas();

		img = new Image();
		img.src = `/images/cosmetics/${cosmetic.thumbnail}.png`;
		img.onload = () => {
			drawImage(img, guesses, hasWon);
		};
	});

	/**
	 * Draw teh	canvas to the correct size
	 */
	function drawCanvas() {
		canvas.width = wrapper.clientWidth;
		canvas.height = wrapper.clientHeight;
	}

	/**
	 * Draws the image applying correct filters based on number of guesses
	 * @param img to draw
	 * @param guesses made by the user
	 * @param hasWon whether the user has won the game
	 */
	function drawImage(img: HTMLImageElement, guesses: number, hasWon: boolean) {
		if (!canvas || !img) return;

		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		if (hasWon) {
			wrapper.style.transform = `rotate(0deg)`;
			ctx.filter = 'grayscale(0)';
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		} else {
			if (guesses < 3) {
				wrapper.style.transform = `rotate(${cosmetic.rotation}deg)`;
			} else {
				wrapper.style.transform = `rotate(0deg)`;
			}
			if (guesses < 6) {
				wrapper.style.filter = 'grayscale(100%)';
				ctx.filter = 'grayscale(100%)';
			} else {
				wrapper.style.filter = 'grayscale(0)';
				ctx.filter = 'grayscale(0)';
			}

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		}
	}
</script>

<div class="flex justify-center">
	<div class="border py-2 rounded-sm">
		<div bind:this={wrapper} class="w-[96px] h-[75px] overflow-hidden">
			<canvas bind:this={canvas}></canvas>
		</div>
	</div>
</div>
