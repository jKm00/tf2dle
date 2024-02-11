import type { Handle, MaybePromise } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	let colorBlindMode = event.cookies.get('colorBlindMode') === 'true';

	const newColorBlindMode = event.url.searchParams.get('active');
	if (newColorBlindMode) {
		colorBlindMode = newColorBlindMode === 'true';
	}

	return await resolve(event, {
		transformPageChunk: ({ html }): MaybePromise<string | undefined> =>
			html.replace('data-colorblind=""', `data-colorblind="${colorBlindMode}"`)
	});
}) satisfies Handle;
