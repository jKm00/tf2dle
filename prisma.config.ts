import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { defineConfig } from 'prisma/config';

const dotenv = config({ path: process.env.DOTENV_CONFIG_PATH, processEnv: {}, quiet: true });
// Expand only file values; explicit process values must stay untouched, even when empty.
for (const key in dotenv.parsed) {
	if (process.env[key] !== undefined) delete dotenv.parsed[key];
}
expand(dotenv);

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: { path: 'prisma/migrations' },
	// Generation does not need a URL. Prisma requires it for migration commands.
	datasource: { url: process.env.DATABASE_URL }
});
