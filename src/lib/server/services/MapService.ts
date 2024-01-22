import maps from '$lib/server/data/maps.json';
import type { Map } from '$lib/types';

class MapService {
	private maps: Map[];

	private static instance: MapService;

	private constructor() {
		this.maps = maps;
	}

	public static getInstance(): MapService {
		if (!MapService.instance) {
			MapService.instance = new MapService();
		}

		return MapService.instance;
	}

	public getTodaysMap() {
		const MULTIPLIER = 1;

		const startingPos = {
			x: Math.floor(Math.random() * (2 + MULTIPLIER) * 100) - 50 * MULTIPLIER,
			y: Math.floor(Math.random() * (2 + MULTIPLIER) * 100) - 50 * MULTIPLIER
		};
		return {
			image: {
				url: this.maps[0].imgUrl,
				startingPos
			},
			hints: [maps[0].releaseDate, maps[0].gameMode]
		};
	}
}

export default MapService;
