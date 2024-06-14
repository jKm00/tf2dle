<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Command as CommandIcon, Menu } from 'lucide-svelte';
	import { allCommands, commandGroups, findCommand, type CommandOption, type CommandType } from '.';
	import { ChevronLeft } from 'lucide-svelte';

	type ActionFunction = (...args: any[]) => any;

	let input = '';
	let open = false;
	let hoveringCommand = commandGroups[0].commands[0].label.toLowerCase();
	let selectedCommand: CommandType | null = null;
	let options: CommandOption[] | null = null;

	$: if (!open) {
		reset();
	}

	$: handleInputChange(input);

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}

			if (open && e.key === 'Enter') {
				handleEnterPressed();
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function handleInputChange(input: string) {
		hoveringCommand =
			allCommands
				.find((command) => command.toLowerCase().includes(input.toLowerCase()))
				?.toLowerCase() || '';
	}

	function handleEnterPressed() {
		if (options && selectedCommand) {
			if (hoveringCommand === 'back') {
				navToStart();
			} else {
				doAction(selectedCommand.action, hoveringCommand);
			}
		} else {
			const command = findCommand(hoveringCommand);
			if (command) {
				if (command.options) {
					selectedCommand = command;
					input = '';
					options = command.options;
				} else {
					doAction(command.action);
				}
			} else {
				console.error(`Failed to find command with label: ${hoveringCommand}`);
			}
		}
	}

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
	<div class="flex items-center gap-2">
		<Menu class="w-4 h-4" />
		Menu
	</div>
	<kbd class="flex gap-1 items-center bg-neutral-800 px-2 py-1 rounded">
		<CommandIcon class="w-4 h-4" />
		K
	</kbd>
</Button>

<Command.Dialog bind:open onValueChange={(e) => (hoveringCommand = e)}>
	<Command.Input bind:value={input} placeholder="Type a command..." />
	<Command.List>
		<Command.Empty>No results found...</Command.Empty>
		{#if options !== null}
			<Command.Group heading={selectedCommand?.label}>
				{#each options as option (option)}
					<Command.Item>
						<button
							on:click={() =>
								selectedCommand
									? doAction(selectedCommand.action, option.value)
									: console.error(`No action available. Option choosen: ${option.label}`)}
							class="flex items-center gap-2 w-full text-left p-3"
						>
							<svelte:component this={option.icon} />
							{option.label}
						</button>
					</Command.Item>
				{/each}
				<Command.Item>
					<button
						on:click={() => navToStart()}
						class="flex items-center gap-2 w-full text-left p-3"
					>
						<ChevronLeft />
						Back
					</button>
				</Command.Item>
			</Command.Group>
		{:else}
			{#each commandGroups as group}
				<Command.Group heading={group.title}>
					{#each group.commands as command}
						<Command.Item>
							<button
								on:click={() => handleSelect(command)}
								class="flex items-center gap-2 w-full text-left p-3"
							>
								<svelte:component this={command.icon} />
								{command.label}
							</button>
						</Command.Item>
					{/each}
				</Command.Group>
			{/each}
		{/if}
	</Command.List>
</Command.Dialog>
