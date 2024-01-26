<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Loader2 } from 'lucide-svelte';
	import { page } from '$app/stores';

	export let data;

	$: console.log($page.error);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Weapon</Card.Title>
		<Card.Description>Guess today's weapon</Card.Description>
	</Card.Header>
	<Card.Content>
		{#await data.todaysWeapon}
			<Loader2 class="h-4 w-4 animate-spin" />
		{:then todaysWeapon}
			<p>Finished loading:</p>
			<p>{todaysWeapon}</p>
		{:catch error}
			<p>Error:</p>
			<p>{error.message}</p>
		{/await}
	</Card.Content>
</Card.Root>
