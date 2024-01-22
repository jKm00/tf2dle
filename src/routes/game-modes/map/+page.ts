import type { PageLoad } from './$types';

export const load = async ({ fetch }) => {
	async function fetchMap() {
		try {
			const res = await fetch('/api/v1/game-modes/map');
			const data = await res.json();

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	return {
		map: await fetchMap()
	};
};
