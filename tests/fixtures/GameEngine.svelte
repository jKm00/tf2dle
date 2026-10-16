<script lang="ts">
	import { writable } from 'svelte/store';
	import { useGameEngine } from '#lib/composables/useGameEngine.ts';

	let {
		gamemode,
		onReady
	}: {
		gamemode: string;
		onReady: (engine: ReturnType<typeof useGameEngine>) => void;
	} = $props();

	// Each mount creates one engine with its initial props.
	// svelte-ignore state_referenced_locally
	onReady(useGameEngine(gamemode, 0, writable<number | undefined>(0)));
</script>
