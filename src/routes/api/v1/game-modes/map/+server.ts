import { json } from '@sveltejs/kit';
import MapService from '$lib/server/services/MapService';

/**
 * Returns the image url of todays map
 */
export function GET() {
	const map = MapService.getInstance().getTodaysMap();

	return json(map);
}
