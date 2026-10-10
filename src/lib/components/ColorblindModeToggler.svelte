<script lang="ts">
	import { Palette } from '@lucide/svelte';
	import Switch from '#lib/components/ui/switch/switch.svelte';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { enhance, type SubmitFunction } from '$app/forms';

	let form = $state<HTMLFormElement>();
	let active = $state(false);
	let pending = $state(false);
	let saveError = $state<string | null>(null);

	if (browser) {
		const htmlColorblindMode = document.documentElement.dataset.colorblind;
		active = htmlColorblindMode === 'true';
	}

	const submitUpdateColorBlindMode: SubmitFunction = ({ action, cancel }) => {
		if (pending) {
			cancel();
			return;
		}
		const previousMode = document.documentElement.dataset.colorblind === 'true';
		const colorblindMode = active;
		// A mouse click can submit before Svelte updates the form's action attribute.
		action.searchParams.set('active', colorblindMode.toString());
		pending = true;
		saveError = null;

		return ({ result }) => {
			// Do not use the default callback: this root action must not navigate away from the game.
			if (result.type === 'success') {
				document.documentElement.dataset.colorblind = colorblindMode.toString();
				active = colorblindMode;
			} else {
				active = previousMode;
				saveError =
					'Could not save colorblind mode. The previous setting was restored. Please try again.';
			}
			pending = false;
		};
	};

	function handleKeyUp(event: KeyboardEvent) {
		if (!pending && (event.key === 'Enter' || event.key === ' ')) {
			form?.requestSubmit();
		}
	}
</script>

<form
	bind:this={form}
	method="POST"
	action="/?/setColorBlindMode&active={active}&redirectTo={page.url.pathname}"
	use:enhance={submitUpdateColorBlindMode}
>
	<div class="flex justify-between">
		<label for="colorblind" class="flex items-center gap-2">
			<Palette class="2-4" />
			Colorblind mode
		</label>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div onkeyup={handleKeyUp}>
			<Switch
				type="submit"
				id="colorblind"
				bind:checked={active}
				disabled={pending}
				aria-busy={pending}
			/>
		</div>
	</div>
	{#if pending}
		<p role="status" class="text-sm text-muted-foreground">Saving colorblind mode...</p>
	{/if}
	{#if saveError}
		<p role="alert" class="text-sm text-destructive">{saveError}</p>
	{/if}
</form>
