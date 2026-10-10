import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const { PrismaPg, PrismaClient, kitEnv, kit } = vi.hoisted(() => ({
	PrismaPg: vi.fn(function () {}),
	PrismaClient: vi.fn(function () {}),
	kitEnv: { DATABASE_URL: undefined as string | undefined },
	kit: { building: false, dev: false }
}));

vi.mock('$app/env', () => kit);
vi.mock('$app/env/private', () => kitEnv);

vi.mock('@prisma/adapter-pg', () => ({ PrismaPg }));
vi.mock('#lib/server/generated/prisma/client.ts', () => ({ PrismaClient }));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	kitEnv.DATABASE_URL = undefined;
	kit.building = false;
	kit.dev = false;
	vi.spyOn(process, 'once').mockReturnValue(process);
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

test('constructs the client with the Kit URL and bounded PostgreSQL pool', async () => {
	const connectionString =
		'postgresql://tf2dle_test:tf2dle_test@127.0.0.1:55432/tf2dle_migration_test';
	kitEnv.DATABASE_URL = connectionString;
	vi.stubEnv('DATABASE_URL', 'postgresql://process-only.invalid/ignored');

	const { db } = await import('#lib/server/prisma.ts');

	expect(PrismaPg).toHaveBeenCalledExactlyOnceWith({
		connectionString,
		max: 10,
		connectionTimeoutMillis: 10_000,
		idleTimeoutMillis: 300_000
	});
	expect(PrismaClient).toHaveBeenCalledExactlyOnceWith({ adapter: PrismaPg.mock.instances[0] });
	expect(db).toBe(PrismaClient.mock.instances[0]);
	expect(process.once).toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
});

test('rejects a missing Kit URL even when process.env has a URL', async () => {
	vi.stubEnv('DATABASE_URL', 'postgresql://process-only.invalid/ignored');

	await expect(import('#lib/server/prisma.ts')).rejects.toThrow(
		'DATABASE_URL is required to connect to the database'
	);
	expect(PrismaPg).not.toHaveBeenCalled();
	expect(PrismaClient).not.toHaveBeenCalled();
});

test('allows build analysis without a database URL', async () => {
	kit.building = true;
	vi.stubEnv('DATABASE_URL', undefined);

	const { db } = await import('#lib/server/prisma.ts');

	expect(PrismaPg).toHaveBeenCalledExactlyOnceWith({
		connectionString: undefined,
		max: 10,
		connectionTimeoutMillis: 10_000,
		idleTimeoutMillis: 300_000
	});
	expect(PrismaClient).toHaveBeenCalledExactlyOnceWith({ adapter: PrismaPg.mock.instances[0] });
	expect(db).toBe(PrismaClient.mock.instances[0]);
	expect(process.once).not.toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
});

test('disconnects the PostgreSQL pool after adapter-node drains requests', async () => {
	kitEnv.DATABASE_URL = 'postgresql://localhost/test';
	const disconnect = vi.fn().mockResolvedValue(undefined);
	PrismaClient.mockImplementationOnce(function () {
		return { $disconnect: disconnect };
	});

	await import('#lib/server/prisma.ts');
	const listener = vi
		.mocked(process.once)
		.mock.calls.find(([event]) => event === 'sveltekit:shutdown')?.[1];
	expect(listener).toBeDefined();
	listener!('SIGTERM');
	expect(disconnect).toHaveBeenCalledOnce();
});

test('does not register production shutdown listeners during development', async () => {
	kitEnv.DATABASE_URL = 'postgresql://localhost/test';
	kit.dev = true;

	await import('#lib/server/prisma.ts');

	expect(process.once).not.toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
});
