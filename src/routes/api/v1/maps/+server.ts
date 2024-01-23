import MapService from '$lib/server/services/MapService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const maps = MapService.getInstance().getMaps();

	return json(maps);
}
