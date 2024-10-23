import type { GuessResponse } from '$lib/dtos';
import { get, writable } from 'svelte/store';
import { useLocalStorage } from './useLocalStorage';
import { useStats } from './useStats';
import dayjs from '$lib/configs/dayjsConfig';
import { toast } from 'svelte-sonner';

export enum GameState {
	WON,
	GUESSING
}

type GameEvent = {
	event: 'won' | 'guessed';
	date: string;
};

type GameEngineOptions<T> = {
	name: string;
	apiRoute: string;
	victoryMessageDelay?: number;
	onReset?: () => void;
	onGuess?: (response: T) => void;
	onWon?: (result: T) => void;
};

const defaultOptions = {
	victoryMessageDelay: 3000
};

/**
 * Game engine providing game state management and game logic.
 *
 * @param name      of the game mode
 * @param options   to customize and add additional logic that should be
 *                  triggered on certain events,
 *                  Look at {@link GameEngineOptions} for more information.
 * @returns
 *      state       - {@link GameState} of the game
 *      stats       - {@code []} of stats
 *      guesses     - {@code []<T>} of guesses
 *      streak      - {@code number} of consecutive wins
 *      validating  - {@code boolean}
 *      init        - {@code () => void} function to initialize the game
 *      guess       - {@code (guess: string) => void} function to make a guess
 */
export function useGameEngine<T extends GuessResponse>(options: GameEngineOptions<T>) {
	const state = writable<GameState>(GameState.GUESSING);
	const validating = writable<boolean>(false);

	const stats = useStats(options.name);

	const lastEvent = useLocalStorage<GameEvent | null>(`${options.name}_last_event`, null);
	const guesses = useLocalStorage<T[]>(`${options.name}_guesses`, []);
	const streak = useLocalStorage<number>(`${options.name}_streak`, 0);

	options = { ...defaultOptions, ...options };

	function init() {
		const _lastEvent = get(lastEvent);

		if (_lastEvent === null) {
			resetGame();
			resetStreak();
			return;
		}

		const shouldResetStreak =
			_lastEvent.event !== `won` ||
			dayjs(_lastEvent.date).isBefore(dayjs.utc().subtract(1, 'day'), 'day');

		if (shouldResetStreak) {
			resetStreak();
		}

		const isSameDay = dayjs.utc(_lastEvent.date).isSame(dayjs.utc(), 'date');
		switch (_lastEvent.event) {
			case 'won':
				if (isSameDay) {
					state.set(GameState.WON);
				} else {
					resetGame();
				}
				break;
			case 'guessed':
				if (isSameDay) {
					state.set(GameState.GUESSING);
				} else {
					resetGame();
				}
				break;
		}
	}

	function resetGame() {
		guesses.set([]);
		state.set(GameState.GUESSING);

		if (options?.onReset) {
			options.onReset();
		}
	}

	function resetStreak() {
		streak.set(0);
	}

	async function guess(guess: string) {
		const _state = get(state);
		const _validation = get(validating);

		if (_state === GameState.WON || _validation) return;

		validating.set(true);

		let result: T | null = null;
		let error: string | null = null;
		try {
			const res = await fetch(`/api/v1/game-modes/${options.apiRoute}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ guess })
			});
			const data = (await res.json()) as T;

			if (!res.ok) {
				error = 'Failed to validate guess. Please try again!';
			} else {
				result = data;
			}
		} catch (err) {
			error = 'Failed to validate guess. Please try again!';
		} finally {
			validating.set(false);
		}

		if (error || !result) {
			toast.error(error || 'Failed to validate guess. Please try again!');
			return;
		}

		guesses.update((prev) => [result, ...prev]);
		lastEvent.set({ event: result.correct ? 'won' : 'guessed', date: result.guessedAt });

		setTimeout(() => {
			if (result.correct) {
				won(result);
			} else if (options?.onGuess) {
				options.onGuess(result);
			}
		}, options!.victoryMessageDelay);
	}

	function won(result: T) {
		streak.update((prev) => prev + 1);
		stats.incrementAttempt(get(guesses).length);
		state.set(GameState.WON);

		if (options?.onWon) {
			options.onWon(result);
		}
	}

	return {
		state,
		stats,
		guesses,
		streak,
		validating,
		init,
		guess
	};
}
