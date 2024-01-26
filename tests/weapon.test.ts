import test, { expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => {
		window.localStorage.clear();
	});
});

test('Weapon page is accessible', async ({ page }) => {
	await page.goto('/');

	await page.getByTestId('weapon').click();
	await page.waitForNavigation();

	await expect(page.getByTestId('title')).toBeVisible();
});

// test('Can enter a weapon', async ({ page }) => {
// 	await page.goto('/game-modes/weapon');

// 	const input = await page.getByTestId('input');
// 	expect(input).toBeVisible();

// 	// await input.fill('scattergun');
// });
