import test, { expect } from '@playwright/test';

test('Colorblind mode preserves the mounted weapon game for mouse and keyboard toggles and reloads', async ({
	page,
	context
}) => {
	await page.goto('/game-modes/weapon?settings-regression=true#challenge');
	const gameUrl = page.url();
	const html = page.locator('html');
	const trigger = page.getByRole('button', { name: 'Settings', exact: true });
	const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
	const toggle = settings.getByRole('switch', { name: 'Colorblind mode', exact: true });
	const challenge = page.getByTestId('title');
	const input = page.getByTestId('input');
	await expect(html).toHaveAttribute('data-colorblind', 'false');

	for (const [interaction, enabled] of [
		['mouse', true],
		['Space', false],
		['Enter', true]
	] as const) {
		await expect(challenge).toHaveText('Weapon');
		await expect(input).toBeVisible();
		const mountedChallenge = await challenge.elementHandle();
		const mountedInput = await input.elementHandle();
		await trigger.click();
		await expect(settings).toBeVisible();
		await expect(toggle).toBeChecked({ checked: !enabled });
		if (interaction === 'mouse') {
			await toggle.click();
		} else {
			await toggle.focus();
			await toggle.press(interaction);
		}
		await expect(toggle).toBeChecked({ checked: enabled });
		await expect(toggle).toHaveAttribute('aria-busy', 'false');
		await expect(html).toHaveAttribute('data-colorblind', String(enabled));
		await expect
			.poll(
				async () =>
					(await context.cookies()).find((cookie) => cookie.name === 'colorBlindMode')?.value
			)
			.toBe(String(enabled));
		await expect(page).toHaveURL(gameUrl);
		await expect(settings).toBeVisible();
		await expect(challenge).toHaveText('Weapon');
		expect(await mountedChallenge!.evaluate((node) => node.isConnected)).toBe(true);
		expect(await mountedInput!.evaluate((node) => node.isConnected)).toBe(true);
		await mountedChallenge!.dispose();
		await mountedInput!.dispose();

		await page.reload();
		await expect(page).toHaveURL(gameUrl);
		await expect(challenge).toHaveText('Weapon');
		await expect(input).toBeVisible();
		await expect(html).toHaveAttribute('data-colorblind', String(enabled));
		expect(
			(await context.cookies()).find((cookie) => cookie.name === 'colorBlindMode')?.value
		).toBe(String(enabled));
		await trigger.click();
		await expect(toggle).toBeChecked({ checked: enabled });
		await page.keyboard.press('Escape');
		await expect(settings).not.toBeVisible();
	}
});

for (const failure of ['action failure', 'server error', 'network error'] as const) {
	test(`Colorblind mode silently restores the saved preference after ${failure}`, async ({
		page,
		context
	}) => {
		await context.addCookies([
			{ name: 'colorBlindMode', value: 'true', url: 'http://127.0.0.1:4173' }
		]);
		await page.goto('/game-modes/weapon');
		const gameUrl = page.url();
		const challenge = page.getByTestId('title');
		await expect(page.getByTestId('input')).toBeVisible();
		const mountedChallenge = await challenge.elementHandle();
		await page.getByRole('button', { name: 'Settings', exact: true }).click();
		const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
		const toggle = settings.getByRole('switch', { name: 'Colorblind mode', exact: true });
		await expect(toggle).toBeChecked();
		let release!: () => void;
		const pendingResponse = new Promise<void>((resolve) => {
			release = resolve;
		});
		const actionUrl = (url: URL) => url.searchParams.has('/setColorBlindMode');
		await page.route(actionUrl, async (route) => {
			expect(route.request().method()).toBe('POST');
			expect(new URL(route.request().url()).searchParams.get('active')).toBe('false');
			await pendingResponse;
			if (failure === 'network error') {
				await route.abort('failed');
			} else if (failure === 'server error') {
				await route.fulfill({ status: 500, body: 'Internal Server Error' });
			} else {
				await route.fulfill({ status: 400, json: { type: 'failure', status: 400, data: '[]' } });
			}
		});
		await toggle.click();
		await expect(toggle).not.toBeChecked();
		await expect(toggle).toBeDisabled();
		await expect(toggle).toHaveAttribute('aria-busy', 'true');
		await expect(settings.getByRole('status')).toHaveCount(0);
		await expect(settings.getByRole('alert')).toHaveCount(0);
		await expect(page.locator('html')).toHaveAttribute('data-colorblind', 'true');
		expect(
			(await context.cookies()).find((cookie) => cookie.name === 'colorBlindMode')?.value
		).toBe('true');
		release();
		await expect(toggle).toBeChecked();
		await expect(toggle).toBeEnabled();
		await expect(toggle).toHaveAttribute('aria-busy', 'false');
		await expect(settings.getByRole('status')).toHaveCount(0);
		await expect(settings.getByRole('alert')).toHaveCount(0);
		await expect(page.locator('html')).toHaveAttribute('data-colorblind', 'true');
		expect(
			(await context.cookies()).find((cookie) => cookie.name === 'colorBlindMode')?.value
		).toBe('true');
		await expect(page).toHaveURL(gameUrl);
		await expect(settings).toBeVisible();
		expect(await mountedChallenge!.evaluate((node) => node.isConnected)).toBe(true);
		await mountedChallenge!.dispose();

		await page.unroute(actionUrl);
		await toggle.focus();
		await toggle.press('Space');
		await expect(page.locator('html')).toHaveAttribute('data-colorblind', 'false');
		await expect(toggle).not.toBeChecked();
		await expect(settings.getByRole('alert')).toHaveCount(0);
		expect(
			(await context.cookies()).find((cookie) => cookie.name === 'colorBlindMode')?.value
		).toBe('false');
		await expect(page).toHaveURL(gameUrl);
		await expect(settings).toBeVisible();
	});
}

test('Settings keyboard focus retains visible outlines in forced colors', async ({ page }) => {
	await page.emulateMedia({ forcedColors: 'active' });
	await page.goto('/');
	const trigger = page.getByRole('button', { name: 'Settings', exact: true });
	const dialog = page.getByRole('dialog', { name: 'Settings', exact: true });
	const toggle = dialog.getByRole('switch', { name: 'Hide reset timer', exact: true });

	for (const control of [trigger, toggle]) {
		if (control === toggle) {
			await page.keyboard.press('Enter');
			await expect(dialog).toBeVisible();
		}
		for (let tabs = 0; tabs < 20; tabs++) {
			await page.keyboard.press('Tab');
			if (await control.evaluate((node) => node === document.activeElement)) break;
		}
		await expect(control).toBeVisible();
		await expect(control).toBeInViewport();
		await expect(control).toBeFocused();
		expect(await control.evaluate((node) => node.matches(':focus-visible'))).toBe(true);
		await expect(control).toHaveCSS('outline-style', 'solid');
		await expect
			.poll(() =>
				control.evaluate((node) => Number.parseFloat(getComputedStyle(node).outlineWidth))
			)
			.toBeGreaterThan(0);
	}
});

test('Settings supports Escape and keyboard toggles and persists the timer preference', async ({
	page
}) => {
	await page.goto('/');
	const timer = page.getByTestId('timer');
	await expect(timer).toBeVisible();
	const trigger = page.getByRole('button', { name: 'Settings', exact: true });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Settings', exact: true });
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(trigger).toBeFocused();

	await trigger.press('Enter');
	await expect(dialog).toBeVisible();
	const toggle = dialog.getByRole('switch', { name: 'Hide reset timer', exact: true });
	await expect(toggle).not.toBeChecked();
	await toggle.focus();
	await toggle.press('Space');
	await expect(toggle).toBeChecked();
	await expect
		.poll(() => page.evaluate(() => localStorage.getItem('hide_reset_timer')))
		.toBe('true');
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(timer).not.toBeVisible();

	await page.reload();
	await expect(timer).not.toBeVisible();
	await trigger.click();
	await expect(dialog).toBeVisible();
	await expect(toggle).toBeChecked();
	await toggle.focus();
	await toggle.press('Space');
	await expect(toggle).not.toBeChecked();
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(timer).toBeVisible();
	await page.reload();
	await expect(timer).toBeVisible();
});

test('Cancelling a mode reset preserves stats; confirming clears only that mode', async ({
	page
}) => {
	await page.addInitScript(() => {
		for (const mode of ['weapon', 'weapon_2', 'map', 'cosmetic', 'unusual']) {
			localStorage.setItem(`${mode}_stats`, '[2,1]');
		}
	});
	await page.goto('/');
	await page.getByRole('button', { name: 'Settings', exact: true }).click();
	const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
	const clear = settings.getByRole('button', { name: 'Clear', exact: true }).first();
	// The Bits child snippet must produce one focusable button, not a nested trigger.
	await expect(clear.locator('button')).toHaveCount(0);
	await clear.focus();
	await clear.press('Enter');
	const confirmation = page.getByRole('alertdialog', { name: 'Clear weapon stats', exact: true });
	await expect(confirmation).toBeVisible();
	const cancel = confirmation.getByRole('button', { name: 'Cancel', exact: true });
	await expect(cancel).toBeFocused();
	await cancel.press('Enter');
	await expect(confirmation).not.toBeVisible();
	await expect(clear).toBeFocused();
	expect(await page.evaluate(() => localStorage.getItem('weapon_stats'))).toBe('[2,1]');
	await expect(
		page.getByText('Stats related to the weapon game mode have been deleted!')
	).toHaveCount(0);

	await clear.press('Space');
	await expect(confirmation).toBeVisible();
	await expect(cancel).toBeFocused();
	await cancel.press('Tab');
	const confirm = confirmation.getByRole('button', { name: 'Clear stats', exact: true });
	await expect(confirm).toBeFocused();
	await confirm.press('Tab');
	await expect(cancel).toBeFocused();
	await cancel.press('Tab');
	await confirm.press('Enter');
	await expect(confirmation).not.toBeVisible();
	await expect(settings).toBeVisible();
	await expect(clear).toBeFocused();
	await expect(
		page.getByText('Stats related to the weapon game mode have been deleted!', { exact: true })
	).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('weapon_stats'))).toBeNull();
	for (const mode of ['weapon_2', 'map', 'cosmetic', 'unusual']) {
		expect(await page.evaluate((key) => localStorage.getItem(key), `${mode}_stats`)).toBe('[2,1]');
	}
});

test('Clear all stats requires confirmation and preserves gameplay and preferences', async ({
	page
}) => {
	await page.addInitScript(() => {
		for (const mode of ['weapon', 'weapon_2', 'map', 'cosmetic', 'unusual']) {
			localStorage.setItem(`${mode}_stats`, '[1]');
		}
		localStorage.setItem('weapon_guesses', '[{"name":"Scattergun","correct":false}]');
		localStorage.setItem('hide_reset_timer', 'true');
	});
	await page.goto('/');
	await page.getByRole('button', { name: 'Settings', exact: true }).click();
	const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
	const trigger = settings.getByRole('button', { name: 'Clear all stats', exact: true });
	await trigger.focus();
	await trigger.press('Enter');
	const confirmation = page.getByRole('alertdialog', { name: 'Clear stats', exact: true });
	await expect(confirmation).toBeVisible();
	await confirmation.getByRole('button', { name: 'Cancel', exact: true }).press('Enter');
	await expect(trigger).toBeFocused();
	for (const mode of ['weapon', 'weapon_2', 'map', 'cosmetic', 'unusual']) {
		expect(await page.evaluate((key) => localStorage.getItem(key), `${mode}_stats`)).toBe('[1]');
	}
	await trigger.press('Enter');
	const confirm = confirmation.getByRole('button', { name: 'Clear all', exact: true });
	await confirm.focus();
	await confirm.press('Enter');
	await expect(confirmation).not.toBeVisible();
	await expect(trigger).toBeFocused();
	await expect(page.getByText('All stats have been deleted!', { exact: true })).toBeVisible();
	for (const mode of ['weapon', 'weapon_2', 'map', 'cosmetic', 'unusual']) {
		expect(await page.evaluate((key) => localStorage.getItem(key), `${mode}_stats`)).toBeNull();
	}
	expect(await page.evaluate(() => localStorage.getItem('weapon_guesses'))).toBe(
		'[{"name":"Scattergun","correct":false}]'
	);
	expect(await page.evaluate(() => localStorage.getItem('hide_reset_timer'))).toBe('true');
});

test('Mobile settings keeps lower controls reachable and restores trigger focus', async ({
	page
}) => {
	await page.setViewportSize({ width: 375, height: 667 });
	await page.goto('/');
	const trigger = page.getByRole('button', { name: 'Settings', exact: true });
	await trigger.click();
	const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
	await expect(settings).toBeVisible();
	const clear = settings.getByRole('button', { name: 'Clear all stats', exact: true });
	await clear.scrollIntoViewIfNeeded();
	await expect(clear).toBeInViewport();
	await clear.click();
	const confirmation = page.getByRole('alertdialog', { name: 'Clear stats', exact: true });
	await expect(confirmation).toBeVisible();
	await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(clear).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(settings).not.toBeVisible();
	await expect(trigger).toBeFocused();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
