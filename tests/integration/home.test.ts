import test, { expect } from '@playwright/test';

test('The home grid shows daily progress and supports whole-card and keyboard navigation', async ({
	page
}, testInfo) => {
	await page.clock.install({ time: new Date('2026-10-10T12:00:00.000Z') });
	await page.clock.setFixedTime(new Date('2026-10-10T12:00:00.000Z'));
	await page.addInitScript(() => {
		localStorage.setItem('weapon_guesses', '[{},{}]');
		localStorage.setItem(
			'weapon_last_event',
			JSON.stringify({ event: 'won', date: '2026-10-10T10:00:00Z' })
		);
		localStorage.setItem('map_guesses', '[{},{}]');
		localStorage.setItem(
			'map_last_event',
			JSON.stringify({ event: 'guessed', date: '2026-10-10T10:00:00Z' })
		);
		localStorage.setItem('warpaint_guesses', '[{}]');
		localStorage.setItem(
			'warpaint_last_event',
			JSON.stringify({ event: 'won', date: '2026-10-09T10:00:00Z' })
		);
	});
	await page.goto('/');
	await expect(page.getByText('1 of 6 solved today', { exact: true })).toBeVisible();
	await expect(page.getByTestId('weapon')).toContainText('Solved in 2');
	await expect(page.getByTestId('map')).toContainText('Continue');
	await expect(page.getByTestId('map')).toContainText('2 guesses today');
	await expect(page.getByTestId('warpaint')).toContainText('New');
	const modes = page.getByRole('list', { name: 'Daily game modes' }).getByRole('link');
	await expect(modes).toHaveCount(6);
	for (const [name, width, height, columns] of [
		['desktop', 1280, 900, 3],
		['mobile', 390, 844, 2]
	] as const) {
		await page.setViewportSize({ width, height });
		const first = (await modes.nth(0).boundingBox())!;
		const rowEnd = (await modes.nth(columns - 1).boundingBox())!;
		const nextRow = (await modes.nth(columns).boundingBox())!;
		expect(Math.abs(first.y - rowEnd.y)).toBeLessThan(1);
		expect(nextRow.y).toBeGreaterThan(first.y + first.height);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await testInfo.attach(`home-grid-${name}`, {
			body: await page.screenshot({ fullPage: true }),
			contentType: 'image/png'
		});
	}
	await page.getByTestId('warpaint').click({ position: { x: 8, y: 8 } });
	await expect(page).toHaveURL('/game-modes/warpaint');
	await page.getByRole('link', { name: 'logo', exact: true }).click();
	await page.getByTestId('weapon').focus();
	await page.keyboard.press('Tab');
	await expect(page.getByTestId('weapon 2')).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/game-modes/weapon-2');
});
