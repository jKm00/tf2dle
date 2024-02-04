import type { Cosmetic } from '$lib/types';
import cosmetics from '$lib/server/data/cosmetics.json';

class CosmeticService {
	private cosmetics: Cosmetic[];

	constructor() {
		this.cosmetics = cosmetics;
	}

	public getCosmetics() {
		return this.cosmetics;
	}
}

export const cosmeticService = new CosmeticService();
