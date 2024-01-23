import maps from '$lib/server/data/maps.json';
import type { Map, SelectedMap } from '$lib/types';

class MapService {
	private maps: Map[];
	private current: SelectedMap | null = null;

	private static instance: MapService;

	private constructor() {
		this.maps = maps;
	}

	/**
	 * Returns an instance of the MapService
	 * @returns an instance of the MapService
	 */
	public static getInstance(): MapService {
		if (!MapService.instance) {
			MapService.instance = new MapService();
		}

		return MapService.instance;
	}

	/**
	 * Selects a random map
	 */
	public selectRandomMap() {
		const map = this.maps[Math.floor(Math.random() * this.maps.length)];

		const MULTIPLIER = 5;
		const startingPos = {
			x: Math.floor(Math.random() * (2 + MULTIPLIER) * 100) - 50 * MULTIPLIER,
			y: Math.floor(Math.random() * (2 + MULTIPLIER) * 100) - 50 * MULTIPLIER
		};

		this.current = {
			name: map.name,
			image: {
				url: map.imgUrl,
				startingPos
			},
			hints: [map.releaseDate, map.gameMode]
		};
	}

	/**
	 * Returns info of todays map
	 * @returns info of todays map
	 */
	public getTodaysMap() {
		if (this.current === null) {
			this.selectRandomMap();
		}

		return {
			image: this.current!.image,
			hints: this.current!.hints
		};
	}

	/**
	 * Returns todays map name if the guess was correct, null otherwise
	 * @param name of the map to check
	 */
	public checkMap(name: string) {
		if (this.current === null) {
			return null;
		}

		return this.current.name.toLowerCase() === name.toLowerCase() ? this.current.name : null;
	}

	/**
	 * Returns a list of all maps
	 * @returns list of all maps
	 */
	public getMaps() {
		return this.maps.map((map) => ({ thumbnail: map.imgUrl, name: map.name }));
	}
}

export default MapService;
