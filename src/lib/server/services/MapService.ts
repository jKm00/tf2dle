import maps from '$lib/server/data/maps.json';
import type { Map } from '$lib/types';
import dayjs from '$lib/configs/dayjsConfig';
import type { MapRepository } from '../repositories/MapRepository';
import { mapRepository } from '../repositories/MapRepositoryPrisma';
import LogService from './LogService';

class MapService {
	private maps: Map[];
	private repo: MapRepository;

	public constructor(repository: MapRepository) {
		this.maps = maps;
		this.repo = repository;
	}

	/**
	 * Selects a random map for the current day
	 */
	public async selectRandomMap() {
		// Select a random map
		const map = this.maps[Math.floor(Math.random() * this.maps.length)];

		// Select a random starting position for the image
		const startingPos = {
			x: Math.floor(Math.random() * 1921),
			y: Math.floor(Math.random() * 1081)
		};

		LogService.log('map', `Selected map: ${map.name}`);

		return await this.repo.save(map.name, startingPos);
	}

	/**
	 * Returns info of todays map
	 * @returns info of todays map
	 */
	public async getTodaysMap() {
		let map = await this.repo.getTodaysMap();

		if (!map) {
			map = await this.selectRandomMap();
		}

		return {
			name: map.name,
			image: this.maps.find((m) => m.name === map!.name)?.image ?? '',
			startingPos: {
				x: map.startingPosX,
				y: map.startingPosY
			},
			hasWon: map.hasWon
		};
	}

	/**
	 * Validates a map guess
	 * @param guess name of the map guessed
	 * @returns an object containing if the guess was correct and
	 * the hints for the guessed map with a value describing if
	 * the hint of the guessed game matches the hint of the correct game
	 */
	public async validateGuess(guess: string) {
		const todaysSavedMap = await this.getTodaysMap();
		const todaysMap = this.maps.find((map) => map.name === todaysSavedMap.name);
		const guessedMap = this.maps.find((map) => map.name.toLowerCase() === guess.toLowerCase());

		const correct = guessedMap?.name === todaysMap?.name;

		const nameStatus = correct ? 'correct' : 'incorrect';
		const nameValue = guessedMap?.name ?? '';

		const guessedGameModes = guessedMap?.gameModes;
		const correctGameModes = todaysMap?.gameModes;

		const gameModesStatus =
			guessedGameModes?.join(',') === correctGameModes?.join(',')
				? 'correct'
				: guessedGameModes?.some((gameMode) => correctGameModes?.includes(gameMode))
					? 'partial'
					: 'incorrect';
		const gameModesValue = guessedMap?.gameModes ?? [];

		const guessedReleaseYear = dayjs(guessedMap?.releaseDate).year();
		const correctReleaseYear = dayjs(todaysMap?.releaseDate).year();
		const releaseDateStatus =
			guessedReleaseYear === correctReleaseYear
				? 'correct'
				: guessedReleaseYear < correctReleaseYear
					? 'later'
					: 'earlier';
		const releaseDateValue = dayjs(guessedMap?.releaseDate).year() ?? '';

		if (correct) {
			await this.repo.incrementTodaysNumberOfCorrectGuesses();
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

	/**
	 * Returns a list of all maps containing their name and thumbnail
	 * @returns list of all maps
	 */
	public getMaps() {
		return this.maps.map((map) => ({ thumbnail: map.thumbnail, name: map.name }));
	}
}

export const mapService = new MapService(mapRepository);
