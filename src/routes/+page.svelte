<script lang="ts">
	import { useStats } from '$lib/composables/stats';
	import GameModes from './GameModes.svelte';

	let stats = useStats('test');
</script>

<button on:click={() => stats.incrementAttempt(Math.floor(Math.random() * 10))}>Test stats</button>

<GameModes />
