import { json } from '@sveltejs/kit';
import MapService from '$lib/server/services/MapService';

/**
 * Returns the info of todays map
 */
export function GET() {
	const map = MapService.getInstance().getTodaysMap();

	return json(map);
}

/**
 * Checks if the name of the map given is todays map
 * @param request a request object with a body containing
 * the name of the map to check in the field 'guess' ({ guess: string})
 * @returns true if the name of the map given is todays map, false otherwise
 */
export async function POST({ request }) {
	const { guess } = await request.json();

	const result = MapService.getInstance().checkMap(guess);

	return json(result);
}
