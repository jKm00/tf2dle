import type { MapGuessResponse } from '$lib/dtos';
import maps from '$lib/server/data/maps.json';
import type { Map, SelectedMap } from '$lib/types';
import dayjs from 'dayjs';
import schedule from 'node-schedule';
import type { Job } from 'node-schedule';

class MapService {
	private scheduler: Job;
	private maps: Map[];
	private current: SelectedMap | null = null;

	private static instance: MapService;

	private constructor() {
		this.maps = maps;
		// Select new map every day at midnight
		this.scheduler = schedule.scheduleJob('0 0 * * *', () => {
			this.selectRandomMap();
		});
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
				url: map.image,
				startingPos
			},
			gameModes: map.gameModes,
			releaseDate: map.releaseDate
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
			image: this.current!.image
		};
	}

	/**
	 * Returns todays map name if the guess was correct, null otherwise
	 * @param name of the map to check
	 */
	public checkMap(name: string): MapGuessResponse {
		if (this.current === null) {
			this.selectRandomMap();
		}

		const guessedMap = this.maps.find((map) => map.name.toLowerCase() === name.toLowerCase());
		const correct = guessedMap?.name === this.current!.name;

		return {
			correct,
			name: guessedMap?.name ?? '',
			gameModes: {
				correct: correct
					? 'correct'
					: this.current!.gameModes.find((mode) => guessedMap?.gameModes.includes(mode)) !== null
						? 'partial'
						: 'incorrect',
				value: guessedMap?.gameModes ?? []
			},
			releaseDate: {
				correct: correct
					? 'correct'
					: dayjs(guessedMap?.releaseDate).isBefore(dayjs(this.current!.releaseDate))
						? 'later'
						: 'earlier',
				value: dayjs(guessedMap?.releaseDate).year() ?? ''
			},
			thumbnail: guessedMap?.thumbnail ?? ''
		};
	}

	/**
	 * Returns a list of all maps
	 * @returns list of all maps
	 */
	public getMaps() {
		return this.maps.map((map) => ({ thumbnail: map.thumbnail, name: map.name }));
	}
}

export default MapService;
