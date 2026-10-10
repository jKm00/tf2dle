import { createServer } from 'node:http';
import { createServerHandler, parseAppOrigin } from './server-handler.mjs';

const origin = parseAppOrigin(process.env.APP_ORIGIN);

// Kit 3 removed runtime ORIGIN. Supply canonical headers before its Node handler constructs requests.
process.env.PROTOCOL_HEADER = 'x-forwarded-proto';
process.env.HOST_HEADER = 'x-forwarded-host';
process.env.PORT_HEADER = '';
/** @type {{ handler: import('node:http').RequestListener }} */
const { handler } = await import(new URL('./build/handler.js', import.meta.url).href);

const server = createServer(createServerHandler(handler, origin));

const port = Number(process.env.PORT ?? 3000);
server.listen(port, process.env.HOST ?? '0.0.0.0', () => {
	console.log(`Listening on port ${port}`);
});
let shuttingDown = false;
for (const signal of /** @type {const} */ (['SIGTERM', 'SIGINT'])) {
	process.on(signal, () => {
		if (shuttingDown) return;
		shuttingDown = true;
		server.close(() => {
			// Let shutdown listeners finish; the existing deadline still bounds cleanup.
			// @ts-expect-error Node's process types do not include SvelteKit's custom event.
			process.emit('sveltekit:shutdown', signal);
		});
		setTimeout(() => process.exit(1), 30_000).unref();
	});
}
