<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import * as Card from '#lib/components/ui/card/index.ts';
	import dayjs from '#lib/configs/dayjsConfig.ts';
	import WinterDecore from '#lib/features/theme/components/winter/WinterDecore.svelte';
	import { onMount } from 'svelte';
	import { gameModes } from '../gamemodes';

	type GamemodeStatus =
		| { state: 'completed'; guesses: number }
		| { state: 'started'; guesses: number }
		| { state: 'not-started' };

	const enabledGamemodes = $derived(gameModes.filter((g) => !g.disabled));
	let gamemodeStatuses = $state<Record<string, GamemodeStatus>>({});

	onMount(() => {
		gamemodeStatuses = Object.fromEntries(
			enabledGamemodes.map((gameMode) => [gameMode.id, getGamemodeStatus(gameMode.id)])
		);
	});

	function getGamemodeStatus(id: string): GamemodeStatus {
		const guesses = parseJson<unknown[]>(localStorage.getItem(`${id}_guesses`), []);
		const lastEvent = parseJson<{ event: string; date: string } | null>(
			localStorage.getItem(`${id}_last_event`),
			null
		);

		const isToday = lastEvent?.date && dayjs.utc(lastEvent.date).isSame(dayjs.utc(), 'date');

		if (isToday && lastEvent?.event === 'won') {
			return { state: 'completed', guesses: guesses.length };
		}

		if (isToday && guesses.length > 0) {
			return { state: 'started', guesses: guesses.length };
		}

		return { state: 'not-started' };
	}

	function parseJson<T>(value: string | null, fallback: T): T {
		if (!value) return fallback;

		try {
			return JSON.parse(value) as T;
		} catch (err) {
			return fallback;
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Game modes</Card.Title>
		<Card.Description>Choose a game mode to play</Card.Description>
	</Card.Header>
	<Card.Content>
		<WinterDecore />
		<ul class="autofit gap-4">
			{#each enabledGamemodes as gamemode}
				{@const status = gamemodeStatuses[gamemode.id]}
				<li class="bg-secondary rounded px-4 py-3">
					<a href="/game-modes{gamemode.href}">
						<div class="flex justify-between">
							<gamemode.icon class="text-primary mb-4" />
							{#if status?.state === 'completed'}
								<Badge>Solved in {status.guesses}</Badge>
							{:else if status?.state === 'started'}
								<Badge>
									{status.guesses}
									{status.guesses === 1 ? 'guess' : 'guesses'} today
								</Badge>
							{:else if gamemode.new}
								<Badge>New</Badge>
							{/if}
						</div>
						<h2 class="font-semibold mb-2">{gamemode.name}</h2>
						<p class="text-sm">{gamemode.description}</p>
					</a>
				</li>
			{/each}
		</ul>
	</Card.Content>
</Card.Root>

<style>
	.autofit {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}
</style>
