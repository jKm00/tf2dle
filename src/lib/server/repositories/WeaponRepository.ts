import type { Weapon } from '$lib/types';

export interface WeaponRepository {
	/**
	 * Returns the name of todays weapon
	 */
	getTodaysWeapon(): Promise<string | null>;

	/**
	 * Saves a weapon as the selected weapon for the current day
	 * @param weapon the weapon to save
	 */
	save(weapon: Weapon): Promise<void>;

	/**
	 * Returns how many have guessed the correct weapon for the current day
	 */
	getNumberOfCorrectGuesses(): Promise<number>;

	/**
	 * Increments the number of correct guesses for the selected weapon of the current day
	 */
	incrementNumberOfCorrectGuesses(): Promise<void>;
}
