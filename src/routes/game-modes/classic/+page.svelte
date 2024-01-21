<script>
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	let weapon = '';

	$: console.log(weapon);
</script>

<section class="grid gap-4 bg-background p-2 pb-3 rounded">
	<header class="bg-card rounded p-4 text-card-foreground">
		<h2 class="font-bold text-2xl">Classic</h2>
		<p>Guess today's weapon</p>
	</header>
	<form class="flex gap-4">
		<Input placeholder="Type a weapon name..." bind:value={weapon} class="flex-grow" />
		<Button>Guess</Button>
	</form>
</section>
