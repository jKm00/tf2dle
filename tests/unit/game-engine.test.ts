import { cleanup, render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { useGameEngine } from '#lib/composables/useGameEngine.ts';
import GameEngine from '../fixtures/GameEngine.svelte';

vi.mock('$app/env', () => ({ browser: true, dev: false, building: false }));

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-10-16T12:00:00Z'));
});

afterEach(() => {
	cleanup();
	localStorage.clear();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

function mountGame(gamemode: string) {
	let engine!: ReturnType<typeof useGameEngine>;
	const { unmount } = render(GameEngine, {
		gamemode,
		onReady: (value: ReturnType<typeof useGameEngine>) => (engine = value)
	});
	return { engine, unmount };
}

describe.each(['weapon', 'warpaint'])('%s streak lifecycle', (gamemode) => {
	it('keeps a completed game and its current streak after mounting', () => {
		localStorage.setItem(`${gamemode}_streak`, '4');
		localStorage.setItem(
			`${gamemode}_last_event`,
			JSON.stringify({ event: 'won', date: '2026-10-16T10:00:00Z' })
		);

		const { engine } = mountGame(gamemode);

		expect(get(engine.gameState)).toBe('won');
		expect(get(engine.streak)).toBe(4);
		expect(localStorage.getItem(`${gamemode}_streak`)).toBe('4');
	});

	it("continues yesterday's streak on victory and preserves it after remounting", async () => {
		localStorage.setItem(`${gamemode}_streak`, '4');
		localStorage.setItem(
			`${gamemode}_last_event`,
			JSON.stringify({ event: 'won', date: '2026-10-15T10:00:00Z' })
		);
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValue(Response.json({ correct: true, guessedAt: new Date().toISOString() }))
		);
		const { engine, unmount } = mountGame(gamemode);
		expect(get(engine.gameState)).toBe('guessing');
		expect(get(engine.streak)).toBe(4);

		await engine.handleGuess('correct answer');
		await vi.runAllTimersAsync();

		expect(get(engine.gameState)).toBe('won');
		expect(get(engine.streak)).toBe(5);
		expect(localStorage.getItem(`${gamemode}_streak`)).toBe('5');

		unmount();
		const { engine: remounted } = mountGame(gamemode);
		expect(get(remounted.gameState)).toBe('won');
		expect(get(remounted.streak)).toBe(5);
	});

	it.each([
		null,
		{ event: 'won', date: '2026-10-14T10:00:00Z' },
		{ event: 'guessed', date: '2026-10-15T10:00:00Z' }
	])('resets the streak when the last event is %j', (lastEvent) => {
		localStorage.setItem(`${gamemode}_streak`, '4');
		if (lastEvent) {
			localStorage.setItem(`${gamemode}_last_event`, JSON.stringify(lastEvent));
		}

		const { engine } = mountGame(gamemode);

		expect(get(engine.gameState)).toBe('guessing');
		expect(get(engine.streak)).toBe(0);
		expect(localStorage.getItem(`${gamemode}_streak`)).toBe('0');
	});
});
