<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Palette, Settings } from 'lucide-svelte';
	import { buttonVariants } from './ui/button';
	import ColorblindModeToggler from './ColorblindModeToggler.svelte';

	let open = true;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost' })}>
		<Settings class="text-muted-foreground" />
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Title>Settings</Dialog.Title>
		<Dialog.Description>Change your settings here</Dialog.Description>
		<div>
			<ColorblindModeToggler />
		</div>
	</Dialog.Content>
</Dialog.Root>
