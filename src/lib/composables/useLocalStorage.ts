import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export function useLocalStorage<T>(key: string, initValue: T) {
	const storedValue = browser ? localStorage.getItem(key) : null;
	const value = storedValue ? JSON.parse(storedValue) : initValue;

	const { subscribe, set, update } = writable<T>(value);

	subscribe((value) => {
		if (browser) {
			localStorage.setItem(key, JSON.stringify(value));
		}
	});

	return {
		subscribe,
		set,
		update
	};
}
