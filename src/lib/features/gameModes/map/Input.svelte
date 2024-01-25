<script lang="ts">
	import type { MapDto } from '$lib/dtos';
	import { createEventDispatcher } from 'svelte';

	export let maps: MapDto[] = [];
	export let guessedMaps: string[];

	const dispatch = createEventDispatcher<{ select: string }>();

	let value = '';
	let inputElement: HTMLInputElement;

	let validating = false;
	let buttonIsFocused = false;

	$: filteredMaps = maps.filter(
		(m) => !guessedMaps.includes(m.name) && m.name.toLowerCase().startsWith(value.toLowerCase())
	);
	$: open = value.length > 0 && filteredMaps.length > 0;

	function handleSelect(name: string) {
		if (validating) return;

		validating = true;
		dispatch('select', name);
		value = '';
		inputElement.focus();

		setTimeout(() => {
			validating = false;
		}, 1500);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			open = false;
		}

		if (event.key === 'Enter' && !buttonIsFocused) {
			const map = filteredMaps[0];
			if (map) {
				handleSelect(filteredMaps[0].name);
			}
		}
	}

	function handleButtonFocus() {
		setTimeout(() => {
			buttonIsFocused = true;
		}, 100);
	}

	function handleButtonUnfocus() {
		setTimeout(() => {
			buttonIsFocused = false;
		}, 100);
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="relative">
	<input
		on:keyup={handleKeyPress}
		class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:rind-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		bind:value
		placeholder="Enter map name..."
		bind:this={inputElement}
	/>
	{#if open}
		<ul
			class="absolute bg-background w-full border border-input ring-offset-background rounded-md max-h-64 overflow-y-auto z-50"
		>
			{#each filteredMaps as map}
				<li class="p-1">
					<button
						on:focusin={handleButtonFocus}
						on:focusout={handleButtonUnfocus}
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
