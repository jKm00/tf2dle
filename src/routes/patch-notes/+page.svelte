<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import patchNotes from '$lib/patchNotes';
</script>

{#each patchNotes as patch}
	<Card.Root class="mb-4">
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
					<article class="mb-6">
						<h4 class="font-semibold mb-1">{feature.title}</h4>
						<p class="text-sm text-muted-foreground">{feature.description}</p>
					</article>
				{/each}
			{/if}
			{#if patch.improvements.length > 0}
				<h3 class="text-sm text-primary font-semibold mb-2">Improvements</h3>
				{#each patch.improvements as improvement}
					<article class="mb-6">
						<h4 class="font-semibold mb-1">{improvement.title}</h4>
						<p class="text-sm text-muted-foreground">{improvement.description}</p>
					</article>
				{/each}
			{/if}
			{#if patch.bugFixes.length > 0}
				<h3 class="text-sm text-primary font-semibold mb-2">Bug fixes</h3>
				{#each patch.bugFixes as fix}
					<article class="mb-6">
						<h4 class="font-semibold mb-1">{fix.title}</h4>
						<p class="text-sm text-muted-foreground">{fix.description}</p>
					</article>
				{/each}
			{/if}
		</Card.Content>
	</Card.Root>
{/each}
