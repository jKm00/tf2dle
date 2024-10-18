export default {
	version: '1.7.2',
	date: '18.10.2024',
	newFeatures: [],
	improvements: [
		{
			title: 'Updated randomizer',
			description:
				'Noticed that the same items were being selected too frequently. The randomizer has been updated, hoping to fix this issue.',
			gameMode: 'All Game Modes'
		}
	],
	bugFixes: [
		{
			title: 'Hide item names from hints',
			description:
				'Replaces item names in hints with a placeholder. Hopyfully, all Game Modes item names are now hidden, but exceptions may still exist.',
			gameMode: 'Weapon 2',
			reportedBy: {
				user: {
					name: 'VaniRabbit',
					link: 'https://www.reddit.com/user/VaniRabbit/'
				},
				note: 'Thanks for reporting this issue!'
			}
		}
	]
};
