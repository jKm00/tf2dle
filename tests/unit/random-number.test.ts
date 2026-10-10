import { describe, expect, it } from 'vitest';
import { generateRandomNumber } from '#lib/server/utils.ts';

describe('random selection', () => {
	it('uses an exclusive upper bound for array indexes', () => {
		for (let i = 0; i < 100; i++) {
			const value = generateRandomNumber(7);
			expect(Number.isInteger(value)).toBe(true);
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(7);
		}
	});

	it('selects the only item in a singleton array', () => {
		expect(generateRandomNumber(1)).toBe(0);
	});

	it.each([0, -1, 1.5, NaN, Infinity, 2 ** 48])('rejects an invalid bound %s', (max) => {
		expect(() => generateRandomNumber(max)).toThrow();
	});
});
