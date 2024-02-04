import { cosmeticService } from '$lib/server/services/CosmeticService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const cosmetics = cosmeticService.getCosmetics();

	return json(
		cosmetics.map((c) => ({ name: c.name, thumbnail: c.image })),
		{ status: 200 }
	);
}
