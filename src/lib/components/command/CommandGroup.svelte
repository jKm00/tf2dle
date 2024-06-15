<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CommandType } from '.';

	const dispatch = createEventDispatcher<{ select: { command: CommandType } }>();

	export let title: string;
	export let commands: CommandType[];
	export let input: string;

	$: filteredCommands = commands.filter((command) =>
		command.keywords.find((keyword) => keyword.toLowerCase().includes(input.toLowerCase()))
	);

	function handleSelect(command: CommandType) {
		dispatch('select', { command });
	}
</script>

{#if filteredCommands.length > 0}
	<div>
		<h2 class="text-muted-foreground text-xs p-2 font-bold">{title}</h2>
		<div class="text-sm">
			{#each filteredCommands as command}
				<button
					on:click={() => handleSelect(command)}
					on:mouseenter={() => focus()}
					class="flex items-center gap-2 w-full text-left p-2 focus:outline-none focus:bg-muted rounded"
				>
					<svelte:component this={command.icon} />
					{command.label}
				</button>
			{/each}
		</div>
	</div>
{/if}
