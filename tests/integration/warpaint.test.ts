import test, { expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import type { WarpaintGuessResponse } from '#lib/features/gamemodes/warpaint/types.ts';

const guessedAt = '2026-10-10T12:00:00.000Z';
const names = [
	'Anodized Aloha',
	'Bank Rolled',
	'Bamboo Brushed',
	'Bloom Buffed',
	'Bonk Varnished',
	'Cardboard Boxed'
];
const requests: Array<{ guess: string; numberOfGuesses: number }> = [];

async function openWarpaint(page: Page) {
	requests.length = 0;
	await page.clock.install({ time: new Date(guessedAt) });
	await page.clock.setFixedTime(new Date(guessedAt));
	await page.route('**/warpaints/*.png', (route) =>
		route.fulfill({
			path: fileURLToPath(
				new URL('../../static/images/warpaints/7595369081124629595.png', import.meta.url)
			),
			contentType: 'image/png'
		})
	);
	await page.route('**/api/v1/warpaints', (route) =>
		route.fulfill({ json: names.map((name) => ({ name, thumbnail: '7595369081124629595' })) })
	);
	await page.route('**/api/v1/game-modes/warpaint/yesterday', (route) =>
		route.fulfill({ json: 'Yesterday paint' })
	);
	await page.route('**/api/v1/game-modes/warpaint', (route) => {
		if (route.request().method() === 'GET') {
			return route.fulfill({
				json: {
					warpaint: {
						thumbnail: '7595369081124629595',
						crop: { x: 0.32, y: 0.29, width: 0.18, height: 0.18 }
					},
					numberOfCorrectGuesses: 7
				}
			});
		}
		const body = route.request().postDataJSON();
		requests.push(body);
		const correct = body.guess === names[0];
		const result: WarpaintGuessResponse = {
			name: body.guess,
			thumbnail: '7595369081124629595',
			correct,
			guessedAt,
			...(!correct ? { feedback: 'Different collection and grade.' } : {}),
			...(body.numberOfGuesses >= 4
				? {
						shortlist: names.map((name, index) => ({
							name,
							ruledOut: body.numberOfGuesses >= 5 && index > 1
						}))
					}
				: {}),
			...(body.numberOfGuesses >= 5 ? { collection: 'Jungle Jackpot Collection' } : {})
		};
		return route.fulfill({ json: result });
	});
	await page.goto('/');
	await page.locator('a[href="/game-modes/warpaint"]').click();
	await expect(page).toHaveURL('/game-modes/warpaint');
	await expect(page.getByTestId('title')).toHaveText('Warpaint');
}

async function submitSearchGuess(page: Page, name: string) {
	await page.clock.runFor(150);
	const input = page.getByRole('combobox', { name: 'Enter your guess' });
	await input.fill(name);
	await input.press('Enter');
	await expect(
		page
			.getByRole('region', { name: 'Guesses', exact: true })
			.getByRole('img', { name, exact: true })
	).toBeVisible();
}

test('Warpaint schedules its hints, replaces search with six choices, and persists a guess-only win', async ({
	page
}, testInfo) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await openWarpaint(page);
	const clue = page.getByRole('img', { name: "Today's warpaint image clue", exact: true });
	const initialView = await clue.getAttribute('viewBox');
	const hints = page.getByRole('region', { name: 'Hints', exact: true });
	await expect(hints.getByRole('heading')).toHaveCount(2);
	await expect(hints.getByText('Unlocks in 4 guesses', { exact: true })).toBeVisible();
	await expect(hints.getByText('Unlocks in 5 guesses', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Reveal more', exact: true })).toHaveCount(0);
	await testInfo.attach('warpaint-mobile-initial-clue', {
		body: await page.screenshot({ fullPage: true }),
		contentType: 'image/png'
	});
	const input = page.getByRole('combobox', { name: 'Enter your guess' });
	await input.fill('Bank');
	await expect(
		page
			.getByRole('option')
			.filter({ hasText: 'Bank Rolled' })
			.getByRole('img', { name: 'Bank Rolled' })
	).toBeVisible();
	await input.press('Enter');
	await expect(page.getByText('Different collection and grade.', { exact: true })).toBeVisible();
	await expect(clue).not.toHaveAttribute('viewBox', initialView!);
	const history = page.getByRole('region', { name: 'Guesses', exact: true });
	await expect(history.getByRole('img', { name: 'Bank Rolled', exact: true })).toBeVisible();
	const wrongGuess = history.getByRole('listitem').filter({ hasText: 'Bank Rolled' });
	await expect(wrongGuess).not.toHaveClass(/bg-incorrect/);
	await expect(wrongGuess.locator('.bg-incorrect')).toBeVisible();
	await expect(wrongGuess.getByRole('img').locator('..')).not.toHaveClass(
		/bg-incorrect|bg-correct/
	);
	await expect(wrongGuess.locator('svg, button')).toHaveCount(0);
	await expect(hints.getByText('Unlocks in 3 guesses', { exact: true })).toBeVisible();
	await submitSearchGuess(page, 'Bamboo Brushed');
	await submitSearchGuess(page, 'Bloom Buffed');
	await expect(clue).toHaveAttribute('viewBox', '0 0 1 1');
	await expect(input).toBeVisible();
	await submitSearchGuess(page, 'Bonk Varnished');
	const shortlist = hints.getByRole('region', { name: 'Name shortlist', exact: true });
	await expect(shortlist.getByRole('button')).toHaveCount(6);
	await expect(shortlist.getByRole('button', { name: /Bank Rolled/ })).toBeDisabled();
	await expect(input).toHaveCount(0);
	await expect(
		shortlist.getByRole('button', { name: 'Anodized Aloha', exact: true })
	).toBeFocused();
	await expect(hints.getByText('Shortlist unlocked', { exact: true })).toBeVisible();
	await expect(
		hints.getByRole('heading', { name: 'Six choices', exact: true }).locator('..')
	).toHaveClass(/bg-primary\/10/);
	await expect(hints.getByText('Unlocks in 1 guess', { exact: true })).toBeVisible();
	await page.reload();
	await expect(shortlist.getByRole('button')).toHaveCount(6);
	await expect(input).toHaveCount(0);
	await shortlist.getByRole('button', { name: 'Cardboard Boxed', exact: true }).click();
	await expect(hints.getByText('Jungle Jackpot Collection', { exact: true })).toBeVisible();
	await expect(
		hints.getByRole('heading', { name: 'Collection hint', exact: true }).locator('..')
	).toHaveClass(/bg-primary\/10/);
	await expect(shortlist.getByRole('button', { name: /Cardboard Boxed/ })).toBeDisabled();
	await expect(input).toHaveCount(0);
	await testInfo.attach('warpaint-mobile-final-hints', {
		body: await page.screenshot({ fullPage: true }),
		contentType: 'image/png'
	});
	await page.setViewportSize({ width: 1280, height: 900 });
	await testInfo.attach('warpaint-desktop-final-hints', {
		body: await page.screenshot({ fullPage: true }),
		contentType: 'image/png'
	});
	await shortlist.getByRole('button', { name: 'Anodized Aloha', exact: true }).click();
	await expect(page.getByTestId('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Close', exact: true }).click();
	await page.clock.runFor(250);
	await expect(page.getByTestId('dialog')).not.toBeVisible();
	await expect(page.getByText('Solved in 6 guesses', { exact: true })).toBeVisible();
	await expect(
		history.getByRole('listitem').filter({ hasText: 'Anodized Aloha' }).locator('.bg-correct')
	).toBeVisible();
	await expect(page.getByRole('link', { name: 'View on the TF2 Wiki' })).toHaveCount(0);
	await page.getByRole('button', { name: 'Open stats' }).click();
	await expect(page.getByText('Avg guesses', { exact: true })).toBeVisible();
	await expect(page.getByTestId('statsDialog').getByText('6.0', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Close', exact: true }).click();
	expect(requests).toEqual(
		[
			'Bank Rolled',
			'Bamboo Brushed',
			'Bloom Buffed',
			'Bonk Varnished',
			'Cardboard Boxed',
			'Anodized Aloha'
		].map((guess, index) => ({ guess, numberOfGuesses: index + 1 }))
	);
	const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('warpaint_stats')!));
	expect(stats).toHaveLength(6);
	expect(stats[5]).toBe(1);
	expect(stats.reduce((total: number, count: number | null) => total + (count ?? 0), 0)).toBe(1);
	await page.reload();
	await expect(page.getByText('Solved in 6 guesses', { exact: true })).toBeVisible();
	await expect(page.getByRole('combobox')).toHaveCount(0);
});

test('A failed warpaint guess preserves the input and does not advance the clue', async ({
	page
}) => {
	await openWarpaint(page);
	await page.route('**/api/v1/game-modes/warpaint', (route) =>
		route.fulfill({ status: 500, json: {} })
	);
	const input = page.getByRole('combobox', { name: 'Enter your guess' });
	await input.fill('Bank');
	await input.press('Enter');
	await expect(
		page.getByRole('alert').filter({ hasText: 'Your guess was not saved.' })
	).toBeVisible();
	await expect(input).toHaveValue('Bank');
	await expect(
		page
			.getByRole('region', { name: 'Hints', exact: true })
			.getByText('Unlocks in 4 guesses', { exact: true })
	).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('warpaint_guesses'))).toBe('[]');
});

test('Existing prototype progress keeps actual guesses and drops reveal-only entries', async ({
	page
}) => {
	await page.addInitScript((date) => {
		localStorage.setItem(
			'warpaint_guesses',
			JSON.stringify([
				{
					action: 'guess',
					name: 'Bank Rolled',
					thumbnail: '7595369081124629595',
					correct: false,
					guessedAt: date
				},
				{ action: 'reveal', name: 'Reveal 1', thumbnail: '', correct: false, guessedAt: date }
			])
		);
		localStorage.setItem('warpaint_last_event', JSON.stringify({ event: 'guessed', date }));
	}, guessedAt);
	await openWarpaint(page);
	const history = page.getByRole('region', { name: 'Guesses', exact: true });
	await expect(history.getByRole('listitem')).toHaveCount(1);
	await expect(history.getByRole('img', { name: 'Bank Rolled', exact: true })).toBeVisible();
	await submitSearchGuess(page, 'Bamboo Brushed');
	expect(requests).toEqual([{ guess: 'Bamboo Brushed', numberOfGuesses: 2 }]);
});

test('A failed warpaint clue image has a retry action', async ({ page }) => {
	await openWarpaint(page);
	await page.route('**/warpaints/*.png', (route) => route.abort());
	await page.reload();
	await expect(page.getByText('The warpaint image could not load.', { exact: true })).toBeVisible();
	await page.route('**/warpaints/*.png', (route) =>
		route.fulfill({
			path: fileURLToPath(
				new URL('../../static/images/warpaints/7595369081124629595.png', import.meta.url)
			),
			contentType: 'image/png'
		})
	);
	await page.getByRole('button', { name: 'Retry image', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Retry image', exact: true })).toHaveCount(0);
	await expect(page.getByText('Loading warpaint clue', { exact: true })).toHaveCount(0);
});
