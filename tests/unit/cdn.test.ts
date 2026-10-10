import { beforeEach, expect, it, vi } from 'vitest';

const environment = vi.hoisted(() => ({ dev: false, PUBLIC_CDN_URL: '' }));
vi.mock('$app/env', () => environment);
vi.mock('$app/env/public', () => environment);

beforeEach(() => {
	vi.resetModules();
	environment.dev = false;
	environment.PUBLIC_CDN_URL = '';
});

it('uses the release-pinned static public CDN URL in production', async () => {
	environment.PUBLIC_CDN_URL = 'https://cdn.example/commit-123/images';
	expect((await import('#lib/constants.ts')).CDN_URL).toBe(environment.PUBLIC_CDN_URL);
});

it('keeps local images in development even when a CDN is configured', async () => {
	environment.dev = true;
	environment.PUBLIC_CDN_URL = 'https://cdn.example/commit-123/images';
	expect((await import('#lib/constants.ts')).CDN_URL).toBe('/images');
});

it('preserves the default CDN when no release override is supplied', async () => {
	expect((await import('#lib/constants.ts')).CDN_URL).toBe(
		'https://cdn.jsdelivr.net/gh/edvardsen-dev/tf2dle@main/static/images'
	);
});
