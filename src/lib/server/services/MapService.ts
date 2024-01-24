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
		this.current = this.selectRandomMap();
		// Select new map every day at midnight
		this.scheduler = schedule.scheduleJob('0 0 * * *', () => {
			this.current = this.selectRandomMap();
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

		return {
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
		return {
			image: this.current!.image
		};
	}

	/**
	 * Returns todays map name if the guess was correct, null otherwise
	 * @param name of the map to check
	 */
	public checkMap(name: string): MapGuessResponse {
		const guessedMap = this.maps.find((map) => map.name.toLowerCase() === name.toLowerCase());

		const correct = guessedMap?.name === this.current!.name;

		const nameStatus = correct ? 'correct' : 'incorrect';
		const nameValue = guessedMap?.name ?? '';

		const guessedGameModes = guessedMap?.gameModes.join(',');
		const correctGameModes = this.current!.gameModes.join(',');

		const gameModesStatus =
			guessedGameModes === correctGameModes
				? 'correct'
				: guessedGameModes?.includes(correctGameModes)
					? 'partial'
					: 'incorrect';
		const gameModesValue = guessedMap?.gameModes ?? [];

		const guessedReleaseYear = dayjs(guessedMap?.releaseDate).year();
		const correctReleaseYear = dayjs(this.current!.releaseDate).year();
		const releaseDateStatus =
			guessedReleaseYear === correctReleaseYear
				? 'correct'
				: guessedReleaseYear < correctReleaseYear
					? 'later'
					: 'earlier';
		const releaseDateValue = dayjs(guessedMap?.releaseDate).year() ?? '';

		return {
			correct,
			name: {
				status: nameStatus,
				value: nameValue
			},
			gameModes: {
				status: gameModesStatus,
				value: gameModesValue
			},
			releaseDate: {
				status: releaseDateStatus,
				value: releaseDateValue
			},
			thumbnail: guessedMap?.thumbnail ?? ''
		};
	}

	/**
	 * Returns a list of all maps containing their name and thumbnail
	 * @returns list of all maps
	 */
	public getMaps() {
		return this.maps.map((map) => ({ thumbnail: map.thumbnail, name: map.name }));
	}
}

export default MapService;
