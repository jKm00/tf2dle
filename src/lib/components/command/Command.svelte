<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Command as CommandIcon, Menu, Search } from 'lucide-svelte';
	import { commandGroups, type CommandOption, type CommandType } from '.';
	import CommandGroup from './CommandGroup.svelte';
	import CommandOptions from './CommandOptions.svelte';

	type ActionFunction = (...args: any[]) => any;

	let input = '';
	let open = false;
	let selectedCommand: CommandType | null = null;
	let options: CommandOption[] | null = null;

	$: if (!open) {
		reset();
	}

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function handleSelect(command: CommandType) {
		if (command.options) {
			selectedCommand = command;
			input = '';
			options = command.options;
		} else {
			doAction(command.action);
		}
	}

	function doAction<T extends ActionFunction>(action: T, ...args: Parameters<T>) {
		if (action) {
			action(...args);
		}

		reset();
	}

	function reset() {
		input = '';
		open = false;
		selectedCommand = null;
		options = null;
	}

	function navToStart() {
		input = '';
		selectedCommand = null;
		options = null;
	}
</script>

<Button
	on:click={() => (open = !open)}
	variant="outline"
	class="absolute top-2 left-2 flex gap-2 items-center justify-between text-muted-foreground w-[230px] text-xs"
>
	<div class="flex items-center gap-2">Quick commands...</div>
	<kbd class="flex gap-1 items-center bg-neutral-800 px-2 py-1 rounded">
		<CommandIcon class="w-4 h-4" />
		K
	</kbd>
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="p-0 gap-0">
		<!-- Command search -->
		<div class="flex p-4 border-b gap-2 text-sm items-center">
			<Search class="w-4 h-4" />
			<input
				type="test"
				bind:value={input}
				placeholder="Type a command..."
				class="bg-transparent focus:outline-none"
			/>
		</div>
		<div class="p-1">
			{#if options !== null}
				<CommandOptions
					on:select={(e) =>
						selectedCommand
							? doAction(selectedCommand.action, e.detail.option.value)
							: console.error(`No action abailable. Option choosen: ${e.detail.option.value}`)}
					on:back={navToStart}
					title={selectedCommand?.label}
					{options}
					{input}
				/>
			{:else}
				{#each commandGroups as group}
					<CommandGroup
						on:select={(e) => handleSelect(e.detail.command)}
						title={group.title}
						commands={group.commands}
						{input}
					/>
				{/each}
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
