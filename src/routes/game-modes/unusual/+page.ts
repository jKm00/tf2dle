import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	function fetchTodaysUnusual() {
		return {
			unusual: {
				thumbnail: 'test,png',
				rotation: 90
			},
			numberOfCorrectGuesses: 3
		};
	}

	function fetchUnusuals() {
		return [
			{
				name: 'Circling Peace Sign',
				thumbnail: 'test.png'
			},
			{ name: 'Bruning Flames', thumbnail: 'test2.png' }
		];
	}

	return {
		todaysUnusual: fetchTodaysUnusual(),
		unusuals: fetchUnusuals()
	};
};
