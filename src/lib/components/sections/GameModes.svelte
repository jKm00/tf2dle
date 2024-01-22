<script lang="ts">
	import { Axe, Map } from 'lucide-svelte';

	const gameModes = [
		{
			name: 'Classic',
			description: 'Guess the correct weapon',
			icon: Axe
		},
		{
			name: 'Map',
			description: 'Guess the correct map',
			icon: Map
		}
	];
</script>

<div class="bg-background p-2 rounded-md shadow-">
	<h2 class="text-foreground mb-2 uppercase font-bold">Game modes</h2>
	<ul class="flex flex-col gap-2">
		{#each gameModes as gameMode}
			<a href={`/game-modes/${gameMode.name.toLowerCase()}`}>
				<li class="flex gap-2 items-center bg-card rounded shadow-inner py-2 px-4">
					<svelte:component this={gameMode.icon} />
					<div class="flex flex-col">
						<h2 class="uppercase font-bold">{gameMode.name}</h2>
						<p class="text-sm">{gameMode.description}</p>
					</div>
				</li>
			</a>
		{/each}
	</ul>
</div>
