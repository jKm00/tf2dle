<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let maps: { name: string; thumbnail: string }[];
	export let guessedMaps: string[];

	const dispatch = createEventDispatcher<{ select: string }>();

	let value = '';
	let inputElement: HTMLInputElement;

	$: filteredMaps = maps.filter(
		(m) => !guessedMaps.includes(m.name) && m.name.toLowerCase().includes(value.toLowerCase())
	);
	$: open = value.length > 0 && filteredMaps.length > 0;

	function handleSelect(name: string) {
		dispatch('select', name);
		value = '';
		inputElement.focus();
	}
</script>

<div class="relative">
	<input
		class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:rind-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		bind:value
		placeholder="Enter map name..."
		bind:this={inputElement}
	/>
	{#if open}
		<ul
			class="absolute bg-background w-full border border-input ring-offset-background rounded-md max-h-64 overflow-y-auto"
		>
			{#each filteredMaps as map}
				<li class="p-1">
					<button
						on:click={() => handleSelect(map.name)}
						class="flex items-center gap-4 p-2 w-full"
					>
						<img src={map.thumbnail} alt={map.name} class="aspect-video w-20" />{map.name}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
