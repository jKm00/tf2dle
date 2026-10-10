import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ADMIN_PASSWORD: { schema: (value) => value },
	DATABASE_URL: { schema: (value) => value },
	PUBLIC_APP_VERSION: { public: true, static: true },
	PUBLIC_CDN_URL: { public: true, static: true, schema: (value) => value }
});
