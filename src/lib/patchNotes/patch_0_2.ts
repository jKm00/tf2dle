export default {
	version: '0.2.0',
	date: '',
	newFeatures: [],
	improvements: [],
	bugFixes: [
		{
			title: 'Typos in table headers',
			description: 'Fixed typos in table headers.',
			gameMode: 'weapon'
		},
		{
			title: 'Timer not resetting at midnight',
			description:
				'Timer would continue to count down after midnight with negative values. Should now reset as expected.',
			gameMode: 'all'
		},
		{
			title: 'Challenge completion bug',
			description:
				"Previously, when first loading the page it would sometimes tell you that you had completed the challenge when you hand't. This should now be fixed.",
			gameMode: 'all'
		}
	]
};
