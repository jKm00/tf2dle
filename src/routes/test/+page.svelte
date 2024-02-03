<script lang="ts">
	export let data;
</script>

{#await data.html}
	<p>loading...</p>
{:then html}
	{@html html}
{:catch error}
	<p>{error.body.message}</p>
{/await}
