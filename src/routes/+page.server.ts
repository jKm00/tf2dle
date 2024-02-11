import type { Actions } from './$types';

export const actions: Actions = {
	setColorBlindMode: async ({ url, cookies }) => {
		const colorBlindMode = url.searchParams.get('active') === 'true';

		cookies.set('colorBlindMode', colorBlindMode ? 'true' : 'false', {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		});
	}
};
