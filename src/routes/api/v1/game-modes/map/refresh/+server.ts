import { CRON_SECRET } from '$env/static/private';
import LogService from '$lib/server/services/LogService';
import MapService from '$lib/server/services/MapService';
import { json } from '@sveltejs/kit';

export async function GET({ request }) {
	const token = request.headers.get('Authorization');

	if (token !== `Bearer ${CRON_SECRET}`) {
		return json('Unauthorized', { status: 401 });
	}

	try {
		const map = await MapService.getInstance().selectRandomMap();
		LogService.getInstance().log(
			'map-refresh',
			`Cron job successfully refreshed the map to: ${map.name}`
		);

		return json('ok');
	} catch (err) {
		return json(err, { status: 500 });
	}
}
