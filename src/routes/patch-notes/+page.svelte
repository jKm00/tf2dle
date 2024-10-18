<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import patchNotes, { lastViewedPatchNote } from '$lib/patchNotes';
	import { onMount } from 'svelte';
	import PatchNoteItem from './patch-note-item.svelte';

	onMount(() => {
		lastViewedPatchNote.set(patchNotes[0].version);
	});
</script>

{#each patchNotes as patch}
	<Card.Root class="mb-4" id={patch.version}>
		<Card.Header>
			<div class="border-b-2 pb-4">
				<Card.Title class="text-2xl">Patch {patch.version}</Card.Title>
				<Card.Description>{patch.date}</Card.Description>
			</div>
		</Card.Header>
		<Card.Content>
			<!-- New Features -->
			{#if patch.newFeatures.length > 0}
				<h3 class="text-sm text-primary font-semibold mb-2">New Features</h3>
				{#each patch.newFeatures as feature}
					<PatchNoteItem item={feature} />
				{/each}
			{/if}
			{#if patch.improvements.length > 0}
				<h3 class="text-sm text-primary font-semibold mb-2">Improvements</h3>
				{#each patch.improvements as improvement}
					<PatchNoteItem item={improvement} />
				{/each}
			{/if}
			{#if patch.bugFixes.length > 0}
				<h3 class="text-sm text-primary font-semibold mb-2">Bug fixes</h3>
				{#each patch.bugFixes as fix}
					<PatchNoteItem item={fix} />
				{/each}
			{/if}
		</Card.Content>
	</Card.Root>
{/each}

<style>
	:global(.patch-link) {
		text-decoration: underline;
	}
</style>
