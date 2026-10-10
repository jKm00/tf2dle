// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const envFile = [
	'POSTGRES_USER=test_user',
	'POSTGRES_PASSWORD=test_password',
	'POSTGRES_DB=test_db',
	'DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}'
].join('\n');

let directory: string;
let path: string;

beforeEach(() => {
	vi.resetModules();
	for (const key of ['DATABASE_URL', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB']) {
		vi.stubEnv(key, undefined);
	}
	directory = mkdtempSync(join(tmpdir(), 'tf2dle-prisma-env-'));
	path = join(directory, '.env');
	writeFileSync(path, envFile);
	vi.stubEnv('DOTENV_CONFIG_PATH', path);
});

afterEach(() => {
	vi.unstubAllEnvs();
	rmSync(directory, { recursive: true, force: true });
});

test('loads DOTENV_CONFIG_PATH and expands PostgreSQL placeholders for the CLI', async () => {
	const { default: config } = await import('../../prisma.config.ts');

	expect(config.datasource?.url).toBe(
		'postgresql://test_user:test_password@localhost:5432/test_db'
	);
	expect(process.env.DATABASE_URL).toBe(config.datasource?.url);
});

test('uses explicit PostgreSQL component values during expansion', async () => {
	vi.stubEnv('POSTGRES_USER', 'explicit_user');

	const { default: config } = await import('../../prisma.config.ts');

	expect(config.datasource?.url).toBe(
		'postgresql://explicit_user:test_password@localhost:5432/test_db'
	);
	expect(process.env.POSTGRES_USER).toBe('explicit_user');
});

test.each(['postgresql://explicit:$literal@localhost/explicit_db', ''])(
	'preserves an explicit DATABASE_URL verbatim: %j',
	async (url) => {
		vi.stubEnv('DATABASE_URL', url);

		const { default: config } = await import('../../prisma.config.ts');

		expect(config.datasource?.url).toBe(url);
		expect(process.env.DATABASE_URL).toBe(url);
	}
);

test('allows CLI configuration without a URL or environment file', async () => {
	vi.stubEnv('DOTENV_CONFIG_PATH', join(directory, 'missing.env'));

	const { default: config } = await import('../../prisma.config.ts');

	expect(config.datasource?.url).toBeUndefined();
	expect(process.env.DATABASE_URL).toBeUndefined();
});
