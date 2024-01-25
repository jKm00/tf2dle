import maps from '$lib/server/data/maps.json';
import type { Map } from '$lib/types';
import dayjs from '$lib/configs/dayjsConfig';
import { db } from '../prisma';

class MapService {
	private maps: Map[];

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
	public async selectRandomMap() {
		// Select a random map
		const map = this.maps[Math.floor(Math.random() * this.maps.length)];

		// Select a random starting position for the image
		const MULTIPLIER = 5;
		const startingPos = {
			x: Math.floor(Math.random() * (2 + MULTIPLIER) * 100) - 50 * MULTIPLIER,
			y: Math.floor(Math.random() * (2 + MULTIPLIER) * 100) - 50 * MULTIPLIER
		};

		// Save the selected map to the database
		const selectedMap = await db.dailyMaps.create({
			data: {
				selectedAt: dayjs.utc().toDate(),
				name: map.name,
				image: map.image,
				startingPosX: startingPos.x,
				startingPosY: startingPos.y,
				gameModes: map.gameModes.join(','),
				releaseDate: dayjs(map.releaseDate).toDate()
			}
		});

		return selectedMap;
	}

	/**
	 * Returns info of todays map
	 * @returns info of todays map
	 */
	public async getTodaysMap() {
		const todaysMap = await db.dailyMaps.findFirst({
			where: {
				selectedAt: dayjs.utc().toDate()
			}
		});

		if (todaysMap === null) {
			return await this.selectRandomMap();
		}

		return todaysMap;
	}

	/**
	 * Returns todays map name if the guess was correct, null otherwise
	 * @param name of the map to check
	 */
	public async checkMap(name: string) {
		const todaysMap = await this.getTodaysMap();
		const guessedMap = this.maps.find((map) => map.name.toLowerCase() === name.toLowerCase());

		const correct = guessedMap?.name === todaysMap.name;

		const nameStatus = correct ? 'correct' : 'incorrect';
		const nameValue = guessedMap?.name ?? '';

		const guessedGameModes = guessedMap?.gameModes;
		const correctGameModes = todaysMap.gameModes;

		const gameModesStatus =
			guessedGameModes?.join(',') === correctGameModes
				? 'correct'
				: guessedGameModes?.some((gameMode) => correctGameModes.split(',').includes(gameMode))
					? 'partial'
					: 'incorrect';
		const gameModesValue = guessedMap?.gameModes ?? [];

		const guessedReleaseYear = dayjs(guessedMap?.releaseDate).year();
		const correctReleaseYear = dayjs(todaysMap.releaseDate).year();
		const releaseDateStatus =
			guessedReleaseYear === correctReleaseYear
				? 'correct'
				: guessedReleaseYear < correctReleaseYear
					? 'later'
					: 'earlier';
		const releaseDateValue = dayjs(guessedMap?.releaseDate).year() ?? '';

		if (correct) {
			this.incrementTodaysCorrectGuesses();
		}

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

	private async incrementTodaysCorrectGuesses() {
		const todaysMap = await this.getTodaysMap();

		await db.dailyMaps.update({
			where: {
				id: todaysMap.id
			},
			data: {
				hasWon: todaysMap.hasWon + 1
			}
		});
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
