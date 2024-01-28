<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/layouts/Footer.svelte';
	import Header from '$lib/components/layouts/Header.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher, setMode } from 'mode-watcher';

	setMode('dark');
</script>

<svelte:head>
	<title>TF2DLE</title>
</svelte:head>

<ModeWatcher />
<Toaster />

<p class="fixed bg-primary py-2 px-12 -rotate-45 -left-10 top-2">Beta</p>
<div class="flex flex-col gap-10 width px-2 m-auto py-10 min-h-screen">
	<Header />
	<div class="flex-grow">
		<slot />
	</div>
	<Footer />
</div>

<style scoped>
	.width {
		width: min(100%, 700px);
	}
</style>
