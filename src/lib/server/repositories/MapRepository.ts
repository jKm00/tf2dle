import type { DailyMaps } from '@prisma/client';

export interface MapRepository {
	/**
	 * Saves the given map as todays map
	 */
	/**
	 * Saves the given map as todays map
	 * @param name of the map
	 * @param pos start position of where to zoom in on the map image
	 */
	save(name: string, pos: { x: number; y: number }): Promise<DailyMaps>;

	/**
	 * Returns the name of todays map
	 */
	getTodaysMap(): Promise<DailyMaps | null>;

	/**
	 * Increments the number of correct guesses for todays map
	 */
	incrementTodaysNumberOfCorrectGuesses(): Promise<void>;
}
