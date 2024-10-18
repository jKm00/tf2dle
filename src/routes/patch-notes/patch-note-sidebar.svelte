<script lang="ts">
	import { browser } from '$app/environment';
	import * as Card from '$lib/components/ui/card';
	import patchNotes from '$lib/patchNotes';
	import { onMount } from 'svelte';

	let activePatchNote = patchNotes[0].version;
	let disableObserver = false;

	onMount(() => {
		if (browser) {
			const options = {
				root: null,
				rootMargin: '0px',
				threshold: 0.5
			};

			const observer = new IntersectionObserver(handleIntersect, options);

			const pacthNotes = document.querySelectorAll('.patch-note');
			pacthNotes.forEach((patchNote) => observer.observe(patchNote));

			function handleIntersect(entries: IntersectionObserverEntry[]) {
				if (disableObserver) return;

				entries.forEach((entry) => {
					const id = entry.target.id;

					if (entry.isIntersecting) {
						activePatchNote = id;
					}
				});
			}
		}
	});

	function handleClick(patchNote: string) {
		disableObserver = true;
		activePatchNote = patchNote;

		setTimeout(() => {
			disableObserver = false;
		}, 1000);
	}
</script>

<Card.Root class="sticky top-4 h-fit max-lg:hidden max-height overflow-y-auto overflow-x-hidden">
	<Card.Header>
		<Card.Title>Updates</Card.Title>
	</Card.Header>
	<Card.Content class="w-[250px]">
		<div class="flex flex-col sidebar">
			{#each patchNotes as patch}
				<a
					href="#{patch.version}"
					on:click={() => handleClick(patch.version)}
					class={activePatchNote === patch.version ? 'text-primary' : 'text-muted-foreground'}
					>Patch {patch.version}</a
				>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<style>
	:global(.max-height) {
		/* Screen height - padding top (8px) and bottom (8px) = 16px */
		max-height: calc(100vh - 32px);
	}
</style>
