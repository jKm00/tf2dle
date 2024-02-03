<script lang="ts">
	import { onMount } from 'svelte';

	let guesses = 0;
	let startingPos = { x: 1000, y: 300 };

	const MAX_ZOOM = 10;

	let wrapper: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	$: drawImage(guesses);

	onMount(() => {
		handleResize();
		drawImage(guesses);
	});

	function handleResize() {
		const { width, height } = wrapper.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;

		drawImage(guesses);
	}

	function drawImage(guesses: number) {
		if (!canvas || guesses > MAX_ZOOM) return;

		const ctx = canvas.getContext('2d');

		const img = new Image();
		img.src = '/images/maps/originals/-254074836349757231.png';

		const cropWidth = img.width / (MAX_ZOOM - guesses);
		const cropHeight = img.height / (MAX_ZOOM - guesses);

		const sX = startingPos.x - startingPos.x / (MAX_ZOOM - guesses);
		const sY = startingPos.y - startingPos.y / (MAX_ZOOM - guesses);

		console.log(sX, sY, cropWidth, cropHeight, canvas.width, canvas.height);

		ctx?.drawImage(img, sX, sY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
	}
</script>

<svelte:window on:resize={handleResize} />

<div class="bg-muted aspect-video rounded-sm overflow-hidden" bind:this={wrapper}>
	<canvas bind:this={canvas} class="bg-green-400/40"></canvas>
</div>

<button on:click={() => guesses++}>New guess</button>
