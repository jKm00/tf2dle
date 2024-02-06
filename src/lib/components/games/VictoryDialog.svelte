<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import TwitterShare from '$lib/components/games/TwitterShare.svelte';

	// Image of the correct guess
	export let img: { src: string; alt: string };
	export let imgSize: string = '100%';
	// Label of the correct guess (e.g. "Weapon", "Map", etc.)
	export let label: string;
	// Value of the correct guess (e.g. "Rocket Launcher", "Badlands", etc.)
	export let value: string;
	// Number of tries it took to guess the correct value
	export let tries: number;
	// The user's current streak
	export let streak: number;
	// How many have already guessed the current challenge
	export let correctGuesses: number;
	// Name of the challenge (e.g. "Weapon", "Map", etc.)
	export let challenge: string;

	export let open: boolean;
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Won!</Dialog.Title>
			<Dialog.Description
				>You are gamer number {correctGuesses} to guess the correct {challenge}!</Dialog.Description
			>
		</Dialog.Header>
		<div class="grid" data-testId="dialog">
			<img src={img.src} alt={img.alt} class="rounded-sm my-4" style={`--width: ${imgSize}`} />
			<div class="grid gap-2 border p-4 rounded-sm mb-4">
				<p class="flex justify-between">
					<span class="font-semibold">{label}:</span>
					{value}
				</p>
				<p class="flex justify-between">
					<span class="font-semibold">Tries:</span>
					{tries}
				</p>
				<p class="flex justify-between">
					<span class="font-semibold">Streak:</span>
					{streak}
				</p>
			</div>
			<TwitterShare {challenge} {tries} {streak} class="mb-2">Share</TwitterShare>
			<Button on:click={() => (open = false)} variant="secondary">Close</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style scoped>
	img {
		width: var(--width, 100%);
		margin-inline: auto;
	}
</style>
