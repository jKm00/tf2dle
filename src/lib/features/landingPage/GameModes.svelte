<script lang="ts">
	import { Axe, Map } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';

	const gameModes = [
		{
			name: 'Weapon',
			description: 'Guess the correct weapon',
			icon: Axe,
			disabled: false
		},
		{
			name: 'Map',
			description: 'Guess the correct map',
			icon: Map,
			disabled: false
		}
	];
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Game mode</Card.Title>
		<Card.Description>Choose a game mode to play</Card.Description>
	</Card.Header>
	<Card.Content>
		<ul class="grid gap-2">
			{#each gameModes.filter((g) => !g.disabled) as gameMode}
				{@const name = gameMode.name.toLowerCase()}
				<a href={`/game-modes/${name}`} data-testId={name}>
					<li class="flex items-center gap-4 bg-secondary rounded px-4 py-2">
						<svelte:component this={gameMode.icon} class="text-primary" />
						<div>
							<h2 class="font-semibold">{gameMode.name}</h2>
							<p class="text-sm">{gameMode.description}</p>
						</div>
					</li>
				</a>
			{/each}
		</ul>
	</Card.Content>
	<Card.Footer>
		<p class="text-muted-foreground text-sm">
			Have suggestions for other game modes? <a
				href="https://www.reddit.com/user/jaakim"
				class="underline">Send me a DM!</a
			>
		</p>
	</Card.Footer>
</Card.Root>
