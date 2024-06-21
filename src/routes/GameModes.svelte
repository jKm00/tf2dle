<script lang="ts">
	import { Axe, GraduationCap, Map, Sparkles } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import dayjs from '$lib/configs/dayjsConfig';

	const gameModes = [
		{
			name: 'Weapon',
			description: 'Guess the correct weapon',
			icon: Axe,
			disabled: false,
			new: false
		},
		{
			name: 'Map',
			description: 'Guess the correct map',
			icon: Map,
			disabled: false,
			new: false
		},
		{
			name: 'Cosmetic',
			description: 'Guess the correct cosmetic',
			icon: GraduationCap,
			disabled: false,
			new: false
		},
		{
			name: 'Unusual',
			description: 'Guess the correct unusual effect',
			icon: Sparkles,
			disabled: false,
			new: dayjs.utc().isBefore(dayjs.utc('2024-08-01'), 'day')
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
				<a
					href={`/game-modes/${name}`}
					data-testId={name}
					class="relative overflow-hidden hover:scale-[1.02] transition-transform"
				>
					{#if gameMode.new}
						<p class="absolute -right-5 top-1/2 -translate-y-1/2 -rotate-45 bg-primary px-10">
							NEW!
						</p>
					{/if}
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
