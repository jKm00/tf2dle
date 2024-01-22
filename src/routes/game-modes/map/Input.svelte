<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { createEventDispatcher } from 'svelte';

	// TODO: Should be passed as prop
	const maps = [
		{
			name: '2Fort',
			thumbnail:
				'https://wiki.teamfortress.com/w/images/thumb/a/a1/Ctf_2fort_bridge_ss.png/150px-Ctf_2fort_bridge_ss.png'
		},
		{
			name: 'Frosty',
			thumbnail:
				'https://wiki.teamfortress.com/w/images/thumb/a/ac/Ctf_frosty.png/150px-Ctf_frosty.png'
		}
	];

	const dispatch = createEventDispatcher<{ select: string }>();

	let value = '';

	$: filteredMaps = maps.filter((m) => m.name.toLowerCase().includes(value.toLowerCase()));
	$: open = value.length > 0 && filteredMaps.length > 0;

	function handleSelect(name: string) {
		dispatch('select', name);
		value = '';
	}
</script>

<div class="relative">
	<Input bind:value placeholder="Enter map name..." />
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
