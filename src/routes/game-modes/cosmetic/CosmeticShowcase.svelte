<script lang="ts">
	import { onMount } from 'svelte';

	export let cosmetic: { thumbnail: string; rotation: number };
	export let guesses: number;
	export let hasWon: boolean;

	let wrapper: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	let img: HTMLImageElement;

	$: drawImage(img, guesses, hasWon);

	onMount(() => {
		drawCanvas();

		img = new Image();
		img.src = `/images/cosmetics/${cosmetic.thumbnail}.png`;
		img.onload = () => {
			drawImage(img, guesses, hasWon);
		};
	});

	function drawCanvas() {
		canvas.width = wrapper.clientWidth;
		canvas.height = wrapper.clientHeight;
	}

	function drawImage(img: HTMLImageElement, guesses: number, hasWon: boolean) {
		if (!canvas || !img) return;

		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		if (hasWon) {
			wrapper.style.transform = `rotate(0deg)`;
			ctx.filter = 'grayscale(0)';
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		} else {
			if (guesses < 5) {
				wrapper.style.transform = `rotate(${cosmetic.rotation}deg)`;
			} else {
				wrapper.style.transform = `rotate(0deg)`;
			}
			if (guesses < 10) {
				ctx.filter = 'grayscale(100%)';
			} else {
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
