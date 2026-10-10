import test, { expect } from '@playwright/test';

test('Production origin rejects cross-origin forms and ignores spoofed proxy headers', async ({
	request,
	baseURL
}) => {
	const sameOrigin = await request.post('/admin/login', {
		headers: {
			origin: baseURL!,
			'x-forwarded-proto': 'https',
			'x-forwarded-host': 'attacker.example'
		},
		form: { password: 'wrong-migration-password' }
	});
	expect(sameOrigin.status()).toBe(400);

	const crossOrigin = await request.post('/admin/login', {
		headers: { origin: 'https://attacker.example' },
		form: { password: 'migration-test-password' }
	});
	expect(crossOrigin.status()).toBe(403);
	expect((await request.get('/admin/logs')).status()).toBe(401);
});

test('Admin rejects wrong passwords and protects logs across login, reload, and logout', async ({
	page
}) => {
	expect((await page.request.get('/admin/logs')).status()).toBe(401);
	await page.goto('/admin');
	await expect(page).toHaveURL('/admin/login');

	await page.getByLabel('Password', { exact: true }).fill('wrong-migration-password');
	await page.getByRole('button', { name: 'Open dashboard' }).click();
	await expect(page.getByText('Invalid password', { exact: true })).toBeVisible();
	await expect(page).toHaveURL('/admin/login');
	expect((await page.request.get('/admin/logs')).status()).toBe(401);

	await page.getByLabel('Password', { exact: true }).fill('migration-test-password');
	await page.getByRole('button', { name: 'Open dashboard' }).click();
	await expect(page).toHaveURL('/admin');
	await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toBeVisible();
	const session = (await page.context().cookies()).find((cookie) => cookie.name === 'tf2dle_admin');
	expect(session).toMatchObject({
		path: '/admin',
		httpOnly: true,
		secure: true,
		sameSite: 'Strict'
	});

	await page.reload();
	await expect(page).toHaveURL('/admin');
	await expect(page.getByRole('button', { name: 'Logout', exact: true })).toBeVisible();
	const logs = await page.evaluate(async () => {
		const response = await fetch('/admin/logs');
		return { status: response.status, body: await response.json() };
	});
	expect(logs.status).toBe(200);
	expect(logs.body).toMatchObject({
		items: expect.any(Array),
		hasMore: expect.any(Boolean)
	});

	await page.getByRole('button', { name: 'Logout', exact: true }).click();
	await expect(page).toHaveURL('/admin/login');
	expect((await page.context().cookies()).some((cookie) => cookie.name === 'tf2dle_admin')).toBe(
		false
	);
	expect((await page.request.get('/admin/logs')).status()).toBe(401);
	await page.goto('/admin');
	await expect(page).toHaveURL('/admin/login');
});
