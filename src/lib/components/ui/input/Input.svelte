<script lang="ts">
	export let placeholder = '';
	export let value = '';

	let clazz = '';
	export { clazz as class };
</script>

<input type="text" {placeholder} bind:value class={`${clazz} border-2 border-accent p-2 rounded`} />
