import { mapService } from '$lib/server/services/MapService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const maps = mapService.getMaps();

	return json(maps);
}
