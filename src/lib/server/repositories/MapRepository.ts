import type { DailyMaps } from '@prisma/client';

export interface MapRepository {
	/**
	 * Saves the given map as todays map
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
