<script lang="ts">
	const steps = 20;

	export let data;

	let currentStep = steps;

	$: ({ map } = data);

	$: pos = map.image.startingPos;

	$: diffX = 50 - map.image.startingPos.x;
	$: diffY = 50 - map.image.startingPos.y;

	$: stepCounterX = diffX / (steps - 1);
	$: stepCounterY = diffY / (steps - 1);

	$: zoom = currentStep;

	function guess(value: string) {
		if (currentStep === 1) return;

		currentStep = currentStep - 1;

		pos = {
			x: pos.x + stepCounterX,
			y: pos.y + stepCounterY
		};
	}
</script>

<section class="grid gap-4 bg-background p-2 pb-3 rounded">
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
	<button on:click={() => guess('Badwater')}>Simulate guess</button>
</section>

<style scoped>
	img {
		top: var(--y);
		left: var(--x);
		transform: translate(-50%, -50%) scale(var(--zoom));
	}
</style>
