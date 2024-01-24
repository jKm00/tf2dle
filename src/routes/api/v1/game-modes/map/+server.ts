import { json } from '@sveltejs/kit';
import MapService from '$lib/server/services/MapService';

/**
 * Returns the info of todays map
 */
export async function GET() {
	const map = await MapService.getInstance().getTodaysMap();

	return json({
		image: {
			url: map.image,
			startingPos: {
				x: map.startingPosX,
				y: map.startingPosY
			}
		}
	});
}

/**
 * Checks if the name of the map given is todays map
 * @param request a request object with a body containing
 * the name of the map to check in the field 'guess' ({ guess: string})
 * @returns true if the name of the map given is todays map, false otherwise
 */
export async function POST({ request }) {
	const { guess } = await request.json();

	const result = await MapService.getInstance().checkMap(guess);

	return json(result);
}
