import type { SelectedMap } from '$lib/types';

export const load = async ({ fetch }) => {
	async function fetchTodaysMap() {
		try {
			const res = await fetch('/api/v1/game-modes/map');
			const data = (await res.json()) as SelectedMap;

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	async function fetchMaps() {
		try {
			const res = await fetch('/api/v1/maps');
			const data = await res.json();

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	return {
		todaysMap: await fetchTodaysMap(),
		maps: await fetchMaps()
	};
};
