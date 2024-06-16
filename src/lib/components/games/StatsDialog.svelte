<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	export let stats: number[];
	export let open: boolean;

	const FULL_WIDTH = 100;

	$: maxTries = getMaxTries(stats);
	$: columnSize = FULL_WIDTH / maxTries;

	function getMaxTries(stats: number[]) {
		let max = 0;
		stats.forEach((value) => {
			if (value > max) {
				max = value;
			}
		});
		return max;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Stats</Dialog.Title>
			<Dialog.Description>Overview of your guessing performance.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4" data-testId="statsDialog">
			{#if stats.length === 0}
				<p class="text-muted-foreground text-sm pt-4" data-testId="noStatsMessage">
					You have no recorded stats at the moment. Guess correct once and come back to see the
					graph!
				</p>
			{:else}
				{#each stats as stat, index}
					<div class="flex w-full items-center gap-2" data-pw="statsGraph">
						<p>{index + 1}</p>
						<div class="bg-primary h-full bar" style="--width: {columnSize * stat}%"></div>
						<p>{stat || ''}</p>
					</div>
				{/each}
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<style scoped>
	.bar {
		width: var(--width, 0);
	}
</style>
