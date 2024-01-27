import { weaponService } from '$lib/server/services/WeaponService';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { guess } = await request.json();

	try {
		const result = await weaponService.validateGuess(guess);

		return json(result, { status: 200 });
	} catch (err) {
		return json('Could not find weapon with name ' + guess, { status: 404 });
	}
}
