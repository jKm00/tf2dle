<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import TwitterShare from './TwitterShare.svelte';
	import { Button } from '$lib/components/ui/button';

	export let imageUrl: string;
	export let mapName: string;
	export let tries: number;
	export let streak: number;

	export let open: boolean;
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Won!</Dialog.Title>
			<Dialog.Description>You guessed the correct map!</Dialog.Description>
		</Dialog.Header>
		<div class="grid">
			<img src={imageUrl} alt={mapName} class="w-full rounded-sm mb-4" />
			<div class="grid gap-2 border p-4 rounded-sm mb-4">
				<p class="flex justify-between">
					<span class="font-semibold">Name:</span>
					{mapName}
				</p>
				<p class="flex justify-between">
					<span class="font-semibold">Tries:</span>
					{tries}
				</p>
				<p class="flex justify-between">
					<span class="font-semibold">Streak:</span>
					{streak}
				</p>
			</div>
			<TwitterShare {tries} {streak} class="mb-2">Share</TwitterShare>
			<Button on:click={() => (open = false)} variant="secondary">Close</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
