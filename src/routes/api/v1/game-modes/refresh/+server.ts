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

	try {
		const map = await mapService.selectRandomMap();
		LogService.getInstance().log(
			'map-refresh',
			`Cron job successfully refreshed the map to: ${map.name}`
		);

		const weapon = await weaponService.selectNewRandomWeapon();
		LogService.getInstance().log(
			'weapon-refresh',
			`Cron job successfully refreshed the weapon to: ${weapon}`
		);

		return json('ok');
	} catch (err) {
		return json(err, { status: 500 });
	}
}
