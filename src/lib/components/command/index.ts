import { goto } from '$app/navigation';
import { openSettings } from '$lib/stores/settings';
import {
	Axe,
	Gamepad2,
	GraduationCap,
	Settings,
	Map,
	MessageSquareText,
	Heart,
	Home,
	Scroll
} from 'lucide-svelte';
import type { ComponentType } from 'svelte';

export type CommandGroup = {
	title: string;
	commands: CommandType[];
};

export type CommandType = {
	icon: ComponentType;
	label: string;
	options?: CommandOption[];
	action: (...args: any[]) => any;
};

export type CommandOption = {
	icon: ComponentType;
	label: string;
	value: string;
};

export const commandGroups: CommandGroup[] = [
	{
		title: 'Navigation',
		commands: [
			{
				label: 'Home',
				icon: Home,
				action: () => goto('/')
			},
			{
				label: 'Gamemodes',
				icon: Gamepad2,
				options: [
					{
						label: 'Weapon',
						value: 'weapon',
						icon: Axe
					},
					{
						label: 'Map',
						value: 'map',
						icon: Map
					},
					{
						label: 'Cosmetic',
						value: 'cosmetic',
						icon: GraduationCap
					}
				],
				action: (gamemode: string) => goto(`/game-modes/${gamemode}`)
			},
			{
				label: 'Patch notes',
				icon: Scroll,
				action: () => goto('/patch-notes')
			}
		]
	},
	{
		title: 'Preferences',
		commands: [
			{
				label: 'Settings',
				icon: Settings,
				action: () => openSettings.set(true)
			}
		]
	},
	{
		title: 'Other',
		commands: [
			{
				label: 'Give feedback',
				icon: MessageSquareText,
				action: () => window.open('https://www.reddit.com/user/jaakim/', '_blank')
			},
			{
				label: 'Support this page',
				icon: Heart,
				action: () => window.open('https://buymeacoffee.com/joakimedvam', '_blank')
			}
		]
	}
];

export const allCommands = commandGroups
	.flatMap((group) => group.commands)
	.flatMap((command) => {
		let commands = [command.label];
		command.options?.forEach((option) => {
			commands.push(option.label);
		});
		return commands;
	});

export function findCommand(label: string) {
	let found = null;
	let i = 0;
	while (!found && i < commandGroups.length) {
		let j = 0;
		while (!found && j < commandGroups[i].commands.length) {
			if (commandGroups[i].commands[j].label.toLowerCase() === label.toLowerCase()) {
				found = commandGroups[i].commands[j];
			}
			j++;
		}
		i++;
	}

	return found;
}
