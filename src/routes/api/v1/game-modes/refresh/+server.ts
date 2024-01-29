import { CRON_SECRET } from '$env/static/private';
import LogService from '$lib/server/services/LogService';
import { mapService } from '$lib/server/services/MapService.js';
import { weaponService } from '$lib/server/services/WeaponService.js';
import { json } from '@sveltejs/kit';

export async function GET({ request }) {
	const token = request.headers.get('Authorization');

	if (token !== `Bearer ${CRON_SECRET}`) {
		return json('Unauthorized', { status: 401 });
	}

	LogService.log('cron-job', 'Cron job started...');

	try {
		await mapService.selectRandomMap();
		await weaponService.selectNewRandomWeapon();
	} catch (err) {
		LogService.log('cron-job', `Cron job failed: ${err}`);
		return json(err, { status: 500 });
	}

	LogService.log('cron-job', 'Cron job finished!');

	return json('ok');
}
