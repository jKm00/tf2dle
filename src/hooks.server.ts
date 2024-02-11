import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	let colorBlindMode = event.cookies.get('colorBlindMode') === 'true';

	const newColorBlindMode = event.url.searchParams.get('active');
	if (newColorBlindMode) {
		colorBlindMode = newColorBlindMode === 'true';
	}

	console.log(colorBlindMode);

	return await resolve(event, {
		// FIXME: Need to fix this error
		transformPageChunk: ({ html }) => {}
	});
}) satisfies Handle;
