export default {
	version: '0.2.0',
	date: '',
	newFeatures: [],
	improvements: [
		{
			title: 'Clear map hints',
			description:
				'As maps only have two hints (game mode and release year) some maps have the same hints, meaning the UI would tell you that you had everything correct when in fact it was the wrong map. Now, the image also has a colored border to indicate whether you have the correct map or not.',
			gameMode: 'map'
		}
	],
	bugFixes: [
		{
			title: 'Fix map cheat',
			description:
				'You can no longer drage the map image to see the full image when it is zoomed in.',
			gameMode: 'map'
		},
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
