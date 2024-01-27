<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let data: { img: string; value: string }[] = [];
	export let guessed: string[];
	export let placeholder = 'Enter your guess';
	export let validationTime = 1500;
	export let imageSize = 3;

	const dispatch = createEventDispatcher<{ select: string }>();

	let value = '';
	let inputElement: HTMLInputElement;
	let validating = false;

	$: filteredData = data.filter(
		(d) => !guessed.includes(d.value) && d.value.toLowerCase().startsWith(value.toLowerCase())
	);

	$: showDropdown = value.length > 0 && filteredData.length > 0;

	function handleSelect(selected: string) {
		if (validating) return;

		validating = true;
		dispatch('select', selected);
		value = '';
		inputElement.focus();

		setTimeout(() => {
			validating = false;
		}, validationTime);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showDropdown = false;
		}

		if (event.key === 'Enter') {
			const data = filteredData[0];
			if (data) {
				handleSelect(data.value);
			}
		}
	}
</script>

<div class="relative">
	<input
		bind:value
		bind:this={inputElement}
		on:keyup={handleKeyPress}
		class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:rind-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		type="text"
		{placeholder}
		data-testId="input"
	/>
	{#if showDropdown}
		<ul
			data-testId="dropdown"
			class="absolute bg-background w-full border border-input ring-offset-background rounded-md max-h-80 overflow-y-auto z-50"
		>
			{#each filteredData as d}
				<li class="p-1">
					<button on:click={() => handleSelect(d.value)} class="flex items-center gap-4 p-2 w-full">
						<img src={d.img} alt={d.value} class="img" style={`--width: ${imageSize}rem`} />
						<span>{d.value}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style scoped>
	.img {
		width: var(--width, 3rem);
	}
</style>