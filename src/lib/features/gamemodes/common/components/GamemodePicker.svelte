<script lang="ts">
	import { ArrowRight, Check } from '@lucide/svelte';
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
	let statusesReady = $state(false);
	const completedCount = $derived(
		Object.values(gamemodeStatuses).filter((status) => status.state === 'completed').length
	);

	onMount(() => {
		gamemodeStatuses = Object.fromEntries(
			enabledGamemodes.map((gameMode) => [gameMode.id, getGamemodeStatus(gameMode.id)])
		);
		statusesReady = true;
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

<Card.Root class="relative">
	<Card.Header class="p-4 sm:p-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="grid gap-1.5">
				<Card.Title>Game modes</Card.Title>
				<Card.Description>Choose your next daily challenge</Card.Description>
			</div>
			<div class="grid min-w-28 gap-2 pt-1" aria-live="polite">
				<p class="text-xs text-muted-foreground">
					{#if statusesReady}
						<span class="font-semibold text-foreground"
							>{completedCount} of {enabledGamemodes.length}</span
						> solved today
					{:else}
						{enabledGamemodes.length} daily puzzles
					{/if}
				</p>
				<div class="flex gap-1" aria-hidden="true">
					{#each enabledGamemodes as _, index}
						<span
							class="h-1 flex-1 rounded-full {index < completedCount
								? 'bg-primary'
								: 'bg-secondary'}"
						></span>
					{/each}
				</div>
			</div>
		</div>
	</Card.Header>
	<Card.Content class="px-4 pb-4 sm:px-6 sm:pb-6">
		<WinterDecore />
		<ul
			class="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3 sm:gap-4"
			aria-label="Daily game modes"
		>
			{#each enabledGamemodes as gamemode}
				{@const status = gamemodeStatuses[gamemode.id]}
				<li class="min-w-0">
					<a
						href="/game-modes{gamemode.href}"
						data-testId={gamemode.name.toLowerCase()}
						class="group flex h-full flex-col gap-3 rounded-xl border p-3 transition-colors duration-150 hover:border-primary/50 hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none sm:gap-4 sm:p-4 {status?.state ===
						'completed'
							? 'border-primary/30 bg-primary/5'
							: 'border-border/80 bg-secondary/25'}"
					>
						<div class="flex min-h-9 items-center justify-between gap-2">
							<span
								class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
							>
								<gamemode.icon class="size-5" aria-hidden="true" />
							</span>
							{#if status?.state === 'completed'}
								<Check class="size-4 text-primary" aria-hidden="true" />
							{:else if status?.state === 'started'}
								<span
									class="whitespace-nowrap rounded-full border border-border bg-background/50 px-2 py-1 text-[10px] font-medium text-muted-foreground sm:text-xs"
								>
									{status.guesses}
									{status.guesses === 1 ? 'guess' : 'guesses'}<span class="sr-only">{' today'}</span
									>
								</span>
							{:else if gamemode.new}
								<span
									class="rounded-full bg-primary/15 px-2 py-1 text-[10px] font-semibold text-primary sm:text-xs"
									>New</span
								>
							{/if}
						</div>
						<div class="grid flex-1 content-start gap-1.5">
							<h2 class="font-semibold leading-tight sm:text-lg">{gamemode.name}</h2>
							<p class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
								{gamemode.description}
							</p>
						</div>
						<div
							class="flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs font-medium {status?.state ===
							'completed'
								? 'text-primary'
								: 'text-foreground'}"
						>
							<span>
								{#if status?.state === 'completed'}Solved in {status.guesses}
								{:else if status?.state === 'started'}Continue
								{:else}Play challenge{/if}
							</span>
							<ArrowRight
								class="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
								aria-hidden="true"
							/>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</Card.Content>
</Card.Root>
