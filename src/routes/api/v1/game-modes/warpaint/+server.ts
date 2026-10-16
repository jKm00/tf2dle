import { error } from '@sveltejs/kit';
import { warpaintService } from '#lib/features/gamemodes/warpaint/server/WarpaintService.ts';
import MetricsService from '#lib/server/services/MetricsService.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return Response.json(await warpaintService.getCurrentWarpaint());
};

export const POST: RequestHandler = async ({ request }) => {
	let body;
	try {
		body = await request.json();
	} catch {
		error(400, 'Please send a valid guess.');
	}
	if (
		!body ||
		typeof body !== 'object' ||
		!Number.isSafeInteger(body.numberOfGuesses) ||
		body.numberOfGuesses < 1 ||
		body.action !== undefined ||
		typeof body.guess !== 'string'
	) {
		error(400, 'Please select a warpaint from the list.');
	}
	const result = await warpaintService.play(body.guess, body.numberOfGuesses);
	if (!result) error(400, 'Please select a warpaint from the list.');
	await MetricsService.recordGameGuess('warpaint', body.numberOfGuesses, result.correct);
	return Response.json(result);
};
