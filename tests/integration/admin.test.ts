import test, { expect } from '@playwright/test';

test('Logs API returns JSON for unauthorized requests regardless of Accept header', async ({
	request
}) => {
	for (const accept of ['text/html', undefined, '*/*', 'application/json']) {
		const response = await request.get('/api/admin/logs', {
			headers: accept ? { Accept: accept } : {}
		});
		expect(response.status()).toBe(401);
		expect(response.headers()['content-type']).toContain('application/json');
		expect(await response.json()).toEqual({ status: 401, message: 'Unauthorized' });
	}
});

test('Runtime origin rejects cross-origin forms and uses the proxy host', async ({
	request,
	baseURL
}) => {
	const sameOrigin = await request.post('/admin/login', {
		headers: {
			origin: baseURL!,
			host: 'attacker.example',
			'x-forwarded-proto': 'http',
			'x-forwarded-host': new URL(baseURL!).host,
			'x-forwarded-port': '9999'
		},
		form: { password: 'wrong-migration-password' }
	});
	expect(sameOrigin.status()).toBe(400);

	const crossOrigin = await request.post('/admin/login', {
		headers: { origin: 'https://attacker.example' },
		form: { password: 'migration-test-password' }
	});
	expect(crossOrigin.status()).toBe(403);
	expect((await request.get('/api/admin/logs')).status()).toBe(401);
});

test('One build accepts different public HTTPS origins supplied at runtime', async ({
	request
}) => {
	for (const origin of ['https://tf2dle.example', 'https://preview.tf2dle.example:8443']) {
		const headers = {
			origin,
			'x-forwarded-proto': 'https',
			'x-forwarded-host': new URL(origin).host
		};
		const sameOrigin = await request.post('/admin/login', {
			headers,
			form: { password: 'wrong-migration-password' }
		});
		expect(sameOrigin.status()).toBe(400);

		const crossOrigin = await request.post('/admin/login', {
			headers: { ...headers, origin: 'https://attacker.example' },
			form: { password: 'migration-test-password' }
		});
		expect(crossOrigin.status()).toBe(403);
	}
});

test('Admin rejects wrong passwords and protects logs across login, reload, and logout', async ({
	page,
	baseURL
}) => {
	const legacyCookie = {
		name: 'tf2dle_admin',
		value: 'legacy-session',
		domain: new URL(baseURL!).hostname,
		path: '/admin',
		httpOnly: true,
		secure: true,
		sameSite: 'Strict' as const
	};
	await page.context().addCookies([legacyCookie]);
	expect((await page.request.get('/api/admin/logs')).status()).toBe(401);
	const redirect = await page.request.get('/admin/logs', { maxRedirects: 0 });
	expect(redirect.status()).toBe(303);
	expect(redirect.headers().location).toBe('/admin/login');
	await page.goto('/admin/logs');
	await expect(page).toHaveURL('/admin/login');

	await page.getByLabel('Password', { exact: true }).fill('wrong-migration-password');
	await page.getByRole('button', { name: 'Open dashboard' }).click();
	await expect(page.getByText('Invalid password', { exact: true })).toBeVisible();
	await expect(page).toHaveURL('/admin/login');
	expect((await page.request.get('/api/admin/logs')).status()).toBe(401);

	await page.getByLabel('Password', { exact: true }).fill('migration-test-password');
	await page.getByRole('button', { name: 'Open dashboard' }).click();
	await expect(page).toHaveURL('/admin');
	await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toBeVisible();
	const sessions = (await page.context().cookies()).filter(
		(cookie) => cookie.name === 'tf2dle_admin'
	);
	expect(sessions).toHaveLength(1);
	const session = sessions[0];
	expect(session).toMatchObject({
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'Strict'
	});

	await page.reload();
	await expect(page).toHaveURL('/admin');
	await expect(page.getByRole('button', { name: 'Logout', exact: true })).toBeVisible();
	const logs = await page.evaluate(async () => {
		const response = await fetch('/api/admin/logs', { headers: { Accept: 'application/json' } });
		return {
			status: response.status,
			contentType: response.headers.get('content-type'),
			body: await response.json()
		};
	});
	expect(logs.status).toBe(200);
	expect(logs.contentType).toContain('application/json');
	expect(logs.body).toMatchObject({
		items: expect.any(Array),
		hasMore: expect.any(Boolean)
	});

	// Also remove the legacy path variant if both cookies are present at logout.
	await page.context().addCookies([{ ...legacyCookie, value: session.value }]);
	await page.getByRole('button', { name: 'Logout', exact: true }).click();
	await expect(page).toHaveURL('/admin/login');
	expect((await page.context().cookies()).some((cookie) => cookie.name === 'tf2dle_admin')).toBe(
		false
	);
	expect((await page.request.get('/api/admin/logs')).status()).toBe(401);
	await page.goto('/admin/logs');
	await expect(page).toHaveURL('/admin/login');
});

for (const viewport of [
	{ width: 1440, height: 900 },
	{ width: 390, height: 844 }
]) {
	test(`Logs paginate with document scrolling and retry at ${viewport.width}px`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await page.goto('/admin/login');
		await page.getByLabel('Password', { exact: true }).fill('migration-test-password');
		await page.getByRole('button', { name: 'Open dashboard' }).click();
		await expect(page).toHaveURL('/admin');

		const entries = Array.from({ length: 65 }, (_, index) => ({
			id: 65 - index,
			createdAt: '2026-10-16T12:00:00.000Z',
			event: 'test',
			message: `Log entry ${65 - index}`
		}));
		const cursors: (string | null)[] = [];
		let failed = false;
		await page.route('**/api/admin/logs?*', async (route) => {
			const request = route.request();
			expect(request.headers().accept).toBe('application/json');
			const params = new URL(request.url()).searchParams;
			const cursor = params.get('afterId');
			cursors.push(cursor);
			if (cursor && !failed) {
				failed = true;
				await route.fulfill({ status: 503 });
				return;
			}
			const remaining = entries.filter((entry) => !cursor || entry.id < Number(cursor));
			const items = remaining.slice(0, Number(params.get('limit')));
			await route.fulfill({
				json: {
					items,
					nextCursor: items.at(-1)?.id ?? null,
					hasMore: remaining.length > items.length
				}
			});
		});

		await page.getByRole('link', { name: 'Logs', exact: true }).click();
		await expect(page.getByRole('heading', { name: 'Operational logs' })).toBeVisible();
		await expect(page.getByRole('article')).toHaveCount(30);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);

		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
		const retry = page.getByRole('button', { name: 'Could not load logs. Retry' });
		await expect(retry).toBeVisible();
		await expect(page.getByRole('article')).toHaveCount(30);
		expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
		await retry.click();
		await expect(page.getByRole('article')).toHaveCount(60);

		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
		await expect(page.getByRole('article')).toHaveCount(65);
		await expect(page.getByText('End of log list', { exact: true })).toBeVisible();
		expect(cursors).toEqual([null, '36', '36', '6']);
	});
}
