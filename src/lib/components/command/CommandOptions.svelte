<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CommandOption } from '.';
	import { ChevronLeft } from 'lucide-svelte';

	const dispatch = createEventDispatcher<{ select: { option: CommandOption }; back: boolean }>();

	export let title = '';
	export let options: CommandOption[];
	export let input: string;

	$: filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(input.toLowerCase())
	);

	function handleSelect(option: CommandOption) {
		dispatch('select', { option });
	}

	function handleNavBack() {
		dispatch('back', true);
	}
</script>

{#if filteredOptions.length > 0}
	<div>
		<h2 class="text-muted-foreground text-xs p-2">{title}</h2>
		<div class="text-sm">
			{#each filteredOptions as option (option.label)}
				<button
					on:click={() => handleSelect(option)}
					class="flex items-center gap-2 w-full text-left p-2"
				>
					<svelte:component this={option.icon} />
					{option.label}
				</button>
			{/each}
			<button on:click={handleNavBack} class="flex items-center gap-2 w-full text-left p-2">
				<ChevronLeft />
				Back
			</button>
		</div>
	</div>
{/if}
