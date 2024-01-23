<script lang="ts">
	import Footer from '$lib/components/layouts/Footer.svelte';
	import Header from '$lib/components/layouts/Header.svelte';
	import '../app.css';
</script>

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
