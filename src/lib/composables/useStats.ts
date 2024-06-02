import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

/**
 * A store that tracks the stats of the player locally
 * @param gamemode to track the stats of
 * @returns a store providing a subscribe function and a function
 * for incrementing the stats
 */
export function useStats(gamemode: string) {
	const LOCAL_STORAGE_KEY = `${gamemode}_stats`;

	// Get init value
	const storedValue = browser && localStorage.getItem(LOCAL_STORAGE_KEY);
	const value = storedValue ? JSON.parse(storedValue) : [];

	const store = writable<number[]>(value);

	/**
	 * Increments the number of correct guesses with the number of attempts
	 * @param attempt it took the player to guess correct
	 */
	function incrementAttempt(attempt: number) {
		let currentStats = get(store);

		if (currentStats[attempt - 1]) {
			currentStats[attempt - 1]++;
		} else {
			currentStats[attempt - 1] = 1;
		}

		store.set(currentStats);

		if (browser) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStats));
		}
	}

	return {
		subscribe: store.subscribe,
		incrementAttempt
	};
}
