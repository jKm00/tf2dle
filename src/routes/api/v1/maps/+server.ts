import { mapService } from '$lib/server/services/MapService';
import { json } from '@sveltejs/kit';

/**
 * Returns a list of all maps
 * @returns all maps
 */
export async function GET() {
	const maps = mapService.getMaps();

	return json(maps);
}
