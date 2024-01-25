<script lang="ts">
	import Footer from '$lib/components/layouts/Footer.svelte';
	import Header from '$lib/components/layouts/Header.svelte';
	import '../app.css';
</script>

<svelte:head>
	<title>TF2DLE</title>
</svelte:head>

<p class="fixed bg-primary py-2 px-12 -rotate-45 -left-10 top-2">Beta</p>
<div class="flex flex-col gap-10 width m-auto py-10 min-h-screen">
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
