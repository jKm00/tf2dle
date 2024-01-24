import { CRON_SECRET } from '$env/static/private';
import MapService from '$lib/server/services/MapService';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const token = request.headers.get('Authorization');

	if (token !== `Bearer ${CRON_SECRET}`) {
		return json('Unauthorized', { status: 401 });
	}

	try {
		MapService.getInstance().selectRandomMap();
		return json('ok');
	} catch (err) {
		return json(err, { status: 500 });
	}
}
