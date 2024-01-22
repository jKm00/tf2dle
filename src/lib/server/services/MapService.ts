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
			map,
			startingPos
		};
	}

	public getTodaysMap() {
		if (this.current === null) {
			this.selectRandomMap();
		}

		return {
			image: {
				url: this.current!.map.imgUrl,
				startingPos: this.current!.startingPos
			},
			hints: [this.current!.map.releaseDate, this.current!.map.gameMode]
		};
	}
}

export default MapService;
