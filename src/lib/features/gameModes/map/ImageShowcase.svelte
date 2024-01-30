<script lang="ts">
	export let url: string;
	export let startingPos: { x: number; y: number };
	export let numberOfGuesses: number;
	export let hasWon: boolean;

	const STEPS = 10;

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
</script>

<div class="relative overflow-hidden aspect-video rounded">
	<div class="absolute inset-0 bg-muted animate-pulse"></div>
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img
		src={url}
		alt="Image of today's map"
		class="absolute"
		style={`--zoom: ${zoom}; --x: ${currentPos.x}%; --y: ${currentPos.y}%;`}
	/>
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
