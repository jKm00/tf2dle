// @vitest-environment node

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, type RequestListener, type Server, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServerHandler, parseAppOrigin } from '../../server-handler.mjs';

const servers: Server[] = [];

async function serve(handler: RequestListener, appOrigin?: string) {
	const server = createServer(createServerHandler(handler, parseAppOrigin(appOrigin)));
	servers.push(server);
	server.listen(0, '127.0.0.1');
	await once(server, 'listening');
	const address = server.address();
	if (!address || typeof address === 'string') throw new Error('Expected a TCP server');
	return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
	await Promise.all(
		servers.splice(0).map(
			(server) =>
				new Promise<void>((resolve) => {
					server.closeAllConnections();
					server.close(() => resolve());
				})
		)
	);
	vi.restoreAllMocks();
});

describe('production request handler', () => {
	it.each(['sync', 'async'])(
		'contains a %s failure before headers without leaking it',
		async (mode) => {
			const error = new Error('private database credentials');
			const log = vi.spyOn(console, 'error').mockImplementation(() => {});
			const url = await serve((request, response) => {
				if (request.url === '/healthy') {
					response.end('healthy');
					return;
				}
				response.setHeader('content-length', '999');
				response.setHeader('x-error', error.message);
				response.statusMessage = error.message;
				if (mode === 'async') return Promise.reject(error);
				throw error;
			});

			const response = await fetch(url);
			expect(response.status).toBe(500);
			expect(response.statusText).toBe('Internal Server Error');
			expect(response.headers.get('x-error')).toBeNull();
			expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
			expect(await response.text()).toBe('Internal Server Error');
			expect(log).toHaveBeenCalledExactlyOnceWith('Request handler failed', error);
			expect(await (await fetch(`${url}/healthy`)).text()).toBe('healthy');
		}
	);

	it.each(['sync', 'async'])(
		'destroys the response after a %s failure with headers sent',
		async (mode) => {
			const error = new Error('private SSR failure');
			const log = vi.spyOn(console, 'error').mockImplementation(() => {});
			let serverResponse: ServerResponse | undefined;
			const url = await serve((_request, response) => {
				serverResponse = response;
				response.write('partial response');
				if (mode === 'async') return Promise.reject(error);
				throw error;
			});

			await expect(fetch(url).then((response) => response.text())).rejects.toThrow();
			expect(serverResponse?.headersSent).toBe(true);
			expect(serverResponse?.destroyed).toBe(true);
			expect(serverResponse?.statusCode).toBe(200);
			expect(log).toHaveBeenCalledExactlyOnceWith('Request handler failed', error);
		}
	);

	it.each([
		['https://EXAMPLE.com:443/', 'https', 'example.com'],
		['http://example.com:8080', 'http', 'example.com:8080'],
		['https://example.com:8443', 'https', 'example.com:8443'],
		[undefined, 'http', undefined],
		['', 'http', undefined]
	])('overwrites spoofed forwarded headers for origin %s', async (origin, protocol, host) => {
		const url = await serve((request, response) => {
			response.end(
				JSON.stringify({
					protocol: request.headers['x-forwarded-proto'],
					host: request.headers['x-forwarded-host']
				})
			);
		}, origin);

		const response = await fetch(url, {
			headers: {
				'x-forwarded-proto': 'https, http',
				'x-forwarded-host': 'attacker.example',
				'x-forwarded-port': '9999'
			}
		});
		expect(await response.json()).toEqual({ protocol, host: host ?? new URL(url).host });
	});
});

describe('APP_ORIGIN validation', () => {
	it.each([
		'ftp://example.com',
		'https://example.com/path',
		'https://example.com/?query=1',
		'https://example.com/#fragment',
		'https://user@example.com',
		'https://user:password@example.com'
	])('rejects %s', (origin) => {
		expect(() => parseAppOrigin(origin)).toThrow(
			'APP_ORIGIN must be an HTTP(S) origin without a path or credentials'
		);
	});

	it('rejects a malformed URL', () => {
		expect(() => parseAppOrigin('not a URL')).toThrow();
	});
});

it('drains HTTP before emitting shutdown and lets async cleanup finish', async () => {
	// Reserve an ephemeral port, then release it for the entrypoint subprocess.
	const reservation = createServer();
	reservation.listen(0, '127.0.0.1');
	await once(reservation, 'listening');
	const address = reservation.address();
	if (!address || typeof address === 'string') throw new Error('Expected a TCP server');
	await new Promise<void>((resolve) => reservation.close(() => resolve()));

	const fakeHandler = `
		process.on('sveltekit:shutdown', (reason) => {
			process.send({ type: 'shutdown', reason });
			setTimeout(() => {
				process.send({ type: 'cleanup-complete' });
				process.disconnect();
			}, 25);
		});
		export function handler(request, response) {
			process.send({ type: 'request-started' });
			process.once('message', () => {
				response.end('finished');
				process.send({ type: 'request-finished' });
			});
		}
	`;
	const handlerUrl = `data:text/javascript,${encodeURIComponent(fakeHandler)}`;
	const injection = `
		import { registerHooks } from 'node:module';
		registerHooks({ resolve(specifier, context, nextResolve) {
			if (specifier.endsWith('/build/handler.js')) {
				return { url: ${JSON.stringify(handlerUrl)}, shortCircuit: true };
			}
			return nextResolve(specifier, context);
		} });
	`;
	const child = spawn(
		process.execPath,
		[
			'--import',
			`data:text/javascript,${encodeURIComponent(injection)}`,
			fileURLToPath(new URL('../../server.mjs', import.meta.url))
		],
		{
			env: { ...process.env, APP_ORIGIN: '', HOST: '127.0.0.1', PORT: String(address.port) },
			stdio: ['ignore', 'pipe', 'pipe', 'ipc']
		}
	);
	const messages: unknown[] = [];
	child.on('message', (message) => messages.push(message));
	const exit = once(child, 'exit');
	try {
		const [output] = await once(child.stdout!, 'data');
		expect(output.toString()).toContain('Listening on port');
		const started = once(child, 'message');
		const response = fetch(`http://127.0.0.1:${address.port}`);
		await started;
		child.kill('SIGTERM');
		child.send('finish-request');
		expect(await (await response).text()).toBe('finished');
		expect(await exit).toEqual([0, null]);
		expect(messages).toEqual([
			{ type: 'request-started' },
			{ type: 'request-finished' },
			{ type: 'shutdown', reason: 'SIGTERM' },
			{ type: 'cleanup-complete' }
		]);
	} finally {
		if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
		await exit;
	}
});
