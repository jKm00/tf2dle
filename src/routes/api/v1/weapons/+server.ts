import { weaponService } from '$lib/server/services/WeaponService';
import { json } from '@sveltejs/kit';

/**
 * Returns a list of all weapon names
 * @returns all weapon names
 */
export async function GET() {
	const maps = weaponService.getWeaponNames();

	return json(maps, { status: 200 });
}
