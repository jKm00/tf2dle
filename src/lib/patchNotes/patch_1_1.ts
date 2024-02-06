export default {
	version: '1.1.0',
	date: '06.02.2024',
	newFeatures: [],
	improvements: [
		{
			title: 'Re-orderd weapon hints',
			description: 'Weapon hints are now ordered in a more logical way.',
			gamemode: 'weapon'
		},
		{
			title: 'Made cosmetic easier',
			description:
				'The hints for the cosmetics are now given at 3, 6, and 9 tries instead of 5, 10, and 15.',
			gamemode: 'cosmetic'
		}
	],
	bugFixes: [
		{
			title: 'Fix grayfilter on mobile',
			description:
				'Grayfilter was not applied to cosmeitc on mobile devices. This should now be fixed.',
			gamemode: 'cosmetic'
		}
	]
};