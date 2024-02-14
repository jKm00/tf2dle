export default {
	version: '1.3',
	date: '',
	newFeatures: [],
	improvements: [],
	bugFixes: [
		{
			title: 'Timing bug',
			description:
				'If you guessed correct some seconds before midnight, the server would validate it to correct, and if by the time it reached the client, a new day had started, it would be marked as if you had guessed the new days puzzle. This has been fixed and should no longer be an issue',
			gameMode: 'all'
		},
		{
			title: 'Cosmetic color show when correct',
			description:
				'Previously, the color of the cosmetic would not be shown when you guessed it correctly prior to the hint. This has been fixed and the color will now be shown when you guess the cosmetic correctly.',
			gameMode: 'cosmetics'
		}
	]
};
