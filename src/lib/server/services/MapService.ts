import maps from '$lib/server/data/maps.json';
import type { Map, SelectedMap } from '$lib/types';

class MapService {
	private maps: Map[];
	private current: SelectedMap | null = null;

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

	public selectRandomMap() {
		const map = this.maps[Math.floor(Math.random() * this.maps.length)];

		const MULTIPLIER = 5;
		const startingPos = {
			x: Math.floor(Math.random() * (2 + MULTIPLIER) * 100) - 50 * MULTIPLIER,
			y: Math.floor(Math.random() * (2 + MULTIPLIER) * 100) - 50 * MULTIPLIER
		};

		this.current = {
			image: {
				url: map.imgUrl,
				startingPos
			},
			hints: [map.releaseDate, map.gameMode]
		};
	}

	public getTodaysMap() {
		if (this.current === null) {
			this.selectRandomMap();
		}

		return this.current;
	}

	public getMaps() {
		return this.maps.map((map) => ({ thumbnail: map.imgUrl, name: map.name }));
	}
}

export default MapService;
