<script lang="ts">
	import { Palette } from 'lucide-svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';

	let form: HTMLFormElement;
	let active = false;

	if (browser) {
		const htmlColorblindMode = document.documentElement.dataset.colorblind;
		active = htmlColorblindMode === 'true';
	}

	const submitUpdateColorBlindMode: SubmitFunction = ({ action }) => {
		const colorblindMode = action.searchParams.get('active') === 'true';

		document.documentElement.dataset.colorblind = colorblindMode.toString();
	};
</script>

<form
	bind:this={form}
	method="POST"
	action="/?/setColorBlindMode&active={active}&redirectTo={$page.url.pathname}"
	use:enhance={submitUpdateColorBlindMode}
>
	<div class="flex justify-between">
		<label for="colorblind" class="flex items-center gap-2">
			<Palette class="2-4" />
			Colorblind mode
		</label>
		<Switch type="submit" id="colorblind" bind:checked={active} />
	</div>
</form>
