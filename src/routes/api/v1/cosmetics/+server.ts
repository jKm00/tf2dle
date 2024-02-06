import { cosmeticService } from '$lib/server/services/CosmeticService';
import { json } from '@sveltejs/kit';

/**
 * Returns a list of all cosmetics
 * @returns the names and thumbnails of all cosmetics
 */
export async function GET() {
	const cosmetics = cosmeticService.getCosmetics();

	return json(
		cosmetics.map((c) => ({ name: c.name, thumbnail: c.image })),
		{ status: 200 }
	);
}
