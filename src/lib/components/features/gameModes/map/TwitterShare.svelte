<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let tries: number;
	export let streak: number;

	let clazz: string;
	export { clazz as class };

	$: query = [
		`text=${encodeURIComponent(
			`I guessed todays tf2dle map in ${tries} tries. My streak is now ${streak}!`
		)}`,
		`url=https://tf2dle.vercel.app`,
		`hashtags=TF2DLE`
	].join('&');

	$: href = `https://twitter.com/intent/tweet?${query}`;

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

<Button target="_blank" {href} on:click={open} class={clazz}><slot /></Button>
