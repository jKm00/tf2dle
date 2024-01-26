<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Loader2, RotateCw } from 'lucide-svelte';

	export let data;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title data-testId="title">Weapon</Card.Title>
		<Card.Description>Guess today's weapon</Card.Description>
	</Card.Header>
	<Card.Content>
		{#await data.todaysWeapon}
			<div class="flex justify-center p-4">
				<Loader2 class="h-4 w-4 animate-spin" />
			</div>
		{:then todaysWeapon}
			<p>Finished loading:</p>
			<p>{todaysWeapon}</p>
		{:catch error}
			<a href="/game-modes/weapon" class="grid justify-items-center gap-4 p-4">
				{error.body.message}
				<RotateCw class="w-4 h-4" />
			</a>
		{/await}
	</Card.Content>
</Card.Root>
