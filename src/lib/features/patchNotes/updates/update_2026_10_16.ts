import type { UpdateDate } from '../types';

export default {
	date: '2026-10-16',
	revisions: [
		{
			id: '2026-10-16.1',
			new: [
				{
					title: 'Added the Warpaint game mode.',
					description:
						'Identify a daily warpaint from an expanding image, with six answer choices after four guesses and a collection hint after five.',
					href: '/game-modes/warpaint'
				}
			],
			improved: [
				{
					title: 'Updated the game mode picker.',
					description:
						'Game modes now use a compact grid with full-card links and a summary of your daily progress.'
				}
			]
		}
	]
} satisfies UpdateDate;
