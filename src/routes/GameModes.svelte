<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { gameModes } from '$lib/game-modes';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Game mode</Card.Title>
		<Card.Description>Choose a game mode to play</Card.Description>
	</Card.Header>
	<Card.Content>
		<ul class="grid gap-2">
			{#each gameModes.filter((g) => !g.disabled) as gameMode}
				{@const favoritePosition = gameMode.new ? '-right-4' : '-right-16'}
				{@const descMargin =
					gameMode.new && gameMode.favorite
						? 'mr-[120px]'
						: gameMode.new || gameMode.favorite
							? 'mr-[70px]'
							: 'mr-[0px]'}
				<a
					href={`/game-modes${gameMode.href}`}
					data-testId={gameMode.name.toLowerCase()}
					class="relative overflow-hidden hover:scale-[1.02] transition-transform"
				>
					{#if gameMode.new}
						<p
							class="absolute -right-12 top-1/2 -translate-y-1/2 -rotate-45 bg-primary py-1 px-20 text-sm"
						>
							NEW!
						</p>
					{/if}
					{#if gameMode.favorite}
						<p
							class="absolute {favoritePosition} top-1/2 -translate-y-1/2 -rotate-45 bg-negative py-1 px-20 text-sm"
						>
							FAVORITE!
						</p>
					{/if}
					<li class="flex items-center gap-4 bg-secondary rounded px-4 py-2">
						<svelte:component this={gameMode.icon} class="text-primary" />
						<div>
							<h2 class="font-semibold">{gameMode.name}</h2>
							<p class="text-sm {descMargin}">{gameMode.description}</p>
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
