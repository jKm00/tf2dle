import { weaponService } from '$lib/server/services/WeaponService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const maps = weaponService.getWeaponNames();

	return json(maps, { status: 200 });
}
