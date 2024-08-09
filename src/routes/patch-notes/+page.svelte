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
					{@const gameModes =
						feature.gameMode instanceof Array ? feature.gameMode.join(', ') : feature.gameMode}
					<article class="mb-6">
						<h4 class="font-semibold mb-2">{feature.title}</h4>
						<p class="text-sm mb-2 leading-6">{@html feature.description}</p>
						<p class="text-sm text-muted-foreground">Game modes: {gameModes}</p>
					</article>
				{/each}
			{/if}
			{#if patch.improvements.length > 0}
				<h3 class="text-sm text-primary font-semibold mb-2">Improvements</h3>
				{#each patch.improvements as improvement}
					{@const gameModes =
						improvement.gameMode instanceof Array
							? improvement.gameMode.join(', ')
							: improvement.gameMode}

					<article class="mb-6">
						<h4 class="font-semibold mb-2">{improvement.title}</h4>
						<p class="text-sm mb-2 leading-6">{@html improvement.description}</p>
						<p class="text-sm text-muted-foreground">Game modes: {gameModes}</p>
					</article>
				{/each}
			{/if}
			{#if patch.bugFixes.length > 0}
				<h3 class="text-sm text-primary font-semibold mb-2">Bug fixes</h3>
				{#each patch.bugFixes as fix}
					{@const gameModes =
						fix.gameMode instanceof Array ? fix.gameMode.join(', ') : fix.gameMode}

					<article class="mb-6">
						<h4 class="font-semibold mb-2">{fix.title}</h4>
						<p class="text-sm mb-2 leading-6">{@html fix.description}</p>
						<p class="text-sm text-muted-foreground">Game modes: {gameModes}</p>
					</article>
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
