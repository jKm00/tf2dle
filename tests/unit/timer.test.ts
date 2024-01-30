import { afterEach, beforeEach, describe, vi, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Footer from '../../src/lib/components/layouts/Footer.svelte';

describe('Timer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it(
		'should reset at midnight',
		async () => {
			const now = Date.UTC(2024, 0, 30, 23, 59, 55);
			vi.setSystemTime(now);

			const { getByTestId } = render(Footer);

			expect(() => getByTestId('timer')).toBeTruthy();

			await wait(5000);

			expect(() => getByTestId('timer')).toBeTruthy();
		},
		{
			timeout: 10000
		}
	);
});

function wait(ms: number) {
	return new Promise<void>((res) => {
		setTimeout(() => {
			res();
		}, ms);
	});
}
