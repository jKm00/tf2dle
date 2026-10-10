import { PrismaPg } from '@prisma/adapter-pg';
import { building, dev } from '$app/env';
import { DATABASE_URL } from '$app/env/private';
import { PrismaClient } from '#lib/server/generated/prisma/client.ts';

const connectionString = DATABASE_URL;
if (!connectionString && !building) {
	throw new Error('DATABASE_URL is required to connect to the database');
}

const adapter = new PrismaPg({
	connectionString,
	max: 10,
	connectionTimeoutMillis: 10_000,
	idleTimeoutMillis: 300_000
});

export const db = new PrismaClient({ adapter });

if (!building && !dev) {
	// Adapter-node emits this after draining HTTP requests.
	process.once('sveltekit:shutdown', () => {
		void db.$disconnect().catch((error: unknown) => {
			console.error('Failed to disconnect from the database', error);
			process.exitCode = 1;
		});
	});
}
