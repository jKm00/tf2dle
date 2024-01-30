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
		}
	]
};
