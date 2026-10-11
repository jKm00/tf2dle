<script lang="ts">
	import GamemodePicker from '#lib/features/gamemodes/common/components/GamemodePicker.svelte';
	import GameModes from './GameModes.svelte';

	const showNewPicker = true;
</script>

<div class="width m-auto">
	{#if showNewPicker}
		<GamemodePicker />
	{:else}
		<GameModes />
	{/if}
</div>

<style>
	.width {
		width: min(100%, 700px);
	}
</style>
