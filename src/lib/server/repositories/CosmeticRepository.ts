import type { Cosmetic } from '$lib/types';
import type { DailyCosmetics } from '@prisma/client';

export interface CosmeticRepository {
	/**
	 * Finds the cosmetic that is selected for the current day
	 */
	findTodaysCosmetic(): Promise<DailyCosmetics | null>;

	/**
	 * Saves a cosmetic as the selected cosmetic for the current day
	 * @param cosmetic the cosmetic to save
	 * @param rotation the rotation to display the cosmetic (0, 90, 180, 270)
	 */
	saveTodaysCosmetic(cosmetic: Cosmetic, rotation: number): Promise<DailyCosmetics>;

	/**
	 * Increments the number of correct guesses for the selected cosmetic of the current day
	 */
	incrementNumberOfCorrectGuesses(): Promise<void>;
}