<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Settings } from 'lucide-svelte';
	import { buttonVariants } from './ui/button';
	import ColorblindModeToggler from './ColorblindModeToggler.svelte';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost' })}>
		<Settings class="text-muted-foreground" />
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Title>Settings</Dialog.Title>
		<Dialog.Description>Change your settings here</Dialog.Description>
		<div class="py-4">
			<ColorblindModeToggler />
		</div>
	</Dialog.Content>
</Dialog.Root>
