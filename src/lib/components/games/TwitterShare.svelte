<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Share } from 'lucide-svelte';

	export let challenge: string;
	export let tries: number;
	export let streak: number;

	let clazz: string;
	export { clazz as class };

	// Query string for the tweet
	$: query = [
		`text=${encodeURIComponent(
			`I guessed today's tf2dle ${challenge.toLowerCase()} in ${tries} ${
				tries === 1 ? 'try' : 'tries'
			}. My streak is now ${streak}!`
		)}`,
		`url=https://tf2dle.com`,
		`hashtags=TF2DLE`
	].join('&');

	$: href = `https://twitter.com/intent/tweet?${query}`;

	/**
	 * Opens a new window with the tweet
	 * @param e the link click event
	 */
	function open(e: Event) {
		e.preventDefault();

		const w = 600;
		const h = 400;
		const x = (screen.width - w) / 2;
		const y = (screen.height - h) / 2;
		const features = `width=${w},height=${h},left=${x},top=${y}`;

		window.open(href, '_blank', features);
	}
</script>

<Button
	target="_blank"
	{href}
	variant="ghost"
	on:click={open}
	class={`${clazz} text-muted-foreground`}><Share class="w-4 h-4" /></Button
>
