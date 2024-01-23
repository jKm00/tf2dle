import type { MapDto, SelectedMapDto } from '$lib/dtos';

export const load = async ({ fetch }) => {
	async function fetchTodaysMap() {
		try {
			const res = await fetch('/api/v1/game-modes/map');
			const data = (await res.json()) as SelectedMapDto;

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	async function fetchMaps() {
		try {
			const res = await fetch('/api/v1/maps');
			const data = (await res.json()) as MapDto[];

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
