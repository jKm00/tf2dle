import type { PatchNote } from './types';

export default {
	version: '0.1.0',
	date: '30.01.2024',
	newFeatures: [
		{
			title: 'Patch notes',
			description: 'Added this page for patch notes.',
			gameMode: 'All Game Modes'
		},
		{
			title: 'Jungle Inferno Weapons',
			description: 'Added Jungle Inferno weapons to the weapon game mode.',
			gameMode: 'Weapon'
		}
	],
	improvements: [
		{
			title: 'Fixed search filtering algorithm',
			description:
				'Previously, it search only for words starting with the search query. Now it searches for words containing the search query making it easier to find what you are looking for.',
			gameMode: 'All Game Modes'
		},
		{
			title: 'Consistent feedback messages',
			description: 'The feedback messegaes are now consistent throughout the different gamemodes.',
			gameMode: 'All Game Modes'
		},
		{
			title: 'Made map gamemode easier',
			description: 'Picture of the map starts less zoomed in making it easier to guess the map.',
			gameMode: 'Map',
			tag: 'improvment'
		}
	],
	bugFixes: [
		{
			title: 'Fixed game reset bug',
			description: 'A bug where the games would reset multiple times a day is now fixed.',
			gameMode: 'All Game Modes'
		}
	]
} as PatchNote;
