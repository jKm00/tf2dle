<script lang="ts">
	import { CDN_URL } from '#lib/constants.ts';
	import Button from '#lib/components/ui/button/button.svelte';
	import { WARPAINT_HINTS, type Crop } from './types.ts';

	let {
		thumbnail,
		crop,
		guesses,
		hasWon
	}: {
		thumbnail: string;
		crop: Crop;
		guesses: number;
		hasWon: boolean;
	} = $props();

	let loaded = $state(false);
	let failed = $state(false);
	let retry = $state(0);
	const clipId = $props.id();
	let view = $derived.by(() => {
		if (hasWon || guesses >= WARPAINT_HINTS.fullImage) return { x: 0, y: 0, width: 1, height: 1 };
		if (guesses >= WARPAINT_HINTS.canvas) return { x: 0.21, y: 0.17, width: 0.55, height: 0.37 };
		if (guesses >= WARPAINT_HINTS.largerCrop) {
			return {
				x: Math.max(0.21, crop.x - crop.width * 0.375),
				y: Math.max(0.17, crop.y - crop.height * 0.375),
				width: crop.width * 1.75,
				height: crop.height * 1.75
			};
		}
		return crop;
	});

	function retryImage() {
		failed = false;
		loaded = false;
		retry += 1;
	}
</script>

<div class="mx-auto w-full max-w-80">
	<div
		class="relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted/20"
	>
		{#if !loaded && !failed}
			<div class="absolute inset-0 animate-pulse bg-muted motion-reduce:animate-none" role="status">
				<span class="sr-only">Loading warpaint clue</span>
			</div>
		{/if}
		{#if failed}
			<div class="absolute inset-0 grid content-center justify-items-center gap-3 p-4 text-center">
				<p role="alert" class="text-sm">The warpaint image could not load.</p>
				<Button variant="outline" onclick={retryImage}>Retry image</Button>
			</div>
		{:else}
			<svg
				viewBox="{view.x} {view.y} {view.width} {view.height}"
				class="relative size-full"
				role="img"
				aria-label={hasWon ? 'The full warpaint image' : "Today's warpaint image clue"}
			>
				<defs>
					<clipPath id={clipId}>
						<rect x={view.x} y={view.y} width={view.width} height={view.height} />
					</clipPath>
				</defs>
				{#key `${thumbnail}:${retry}`}
					<image
						href="{CDN_URL}/warpaints/{thumbnail}.png"
						width="1"
						height="1"
						clip-path="url(#{clipId})"
						onload={() => (loaded = true)}
						onerror={() => (failed = true)}
					/>
				{/key}
			</svg>
		{/if}
	</div>
</div>
