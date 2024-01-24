<script lang="ts">
	const items = [
		{
			name: 'Correct',
			color: 'bg-correct'
		},
		{
			name: 'Partially correct',
			color: 'bg-partial'
		},
		{
			name: 'Incorrect',
			color: 'bg-incorrect'
		}
	];
</script>

<div class="flex gap-4 m-auto">
	{#each items as item}
		<div class="flex items-center gap-2">
			<div class={`w-4 h-4 ${item.color} rounded-sm`}></div>
			<p>{item.name}</p>
		</div>
	{/each}
</div>
