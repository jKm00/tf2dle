/** @param {string | undefined} appOrigin */
export function parseAppOrigin(appOrigin) {
	const origin = appOrigin ? new URL(appOrigin) : null;
	if (
		origin &&
		(!['http:', 'https:'].includes(origin.protocol) ||
			origin.pathname !== '/' ||
			origin.search ||
			origin.hash ||
			origin.username ||
			origin.password)
	) {
		throw new Error('APP_ORIGIN must be an HTTP(S) origin without a path or credentials');
	}
	return origin;
}

/**
 * @param {import('node:http').RequestListener} handler
 * @param {URL | null} origin
 * @returns {import('node:http').RequestListener}
 */
export function createServerHandler(handler, origin) {
	return async (request, response) => {
		try {
			request.headers['x-forwarded-proto'] = origin?.protocol.slice(0, -1) ?? 'http';
			request.headers['x-forwarded-host'] = origin?.host ?? request.headers.host;
			await handler(request, response);
		} catch (error) {
			console.error('Request handler failed', error);
			if (response.headersSent) {
				response.destroy();
			} else {
				for (const name of response.getHeaderNames()) response.removeHeader(name);
				response.writeHead(500, 'Internal Server Error', {
					'content-type': 'text/plain; charset=utf-8'
				});
				response.end('Internal Server Error');
			}
		}
	};
}
