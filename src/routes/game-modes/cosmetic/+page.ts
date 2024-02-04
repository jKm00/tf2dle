import type { CosmeticDto } from '$lib/dtos';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	async function fetchCosmetics() {
		let res;
		let data;
		let errorMessage: string | null = null;

		try {
			res = await fetch('/api/v1/cosmetics');
			data = (await res.json()) as CosmeticDto[];

			if (!res.ok) {
				errorMessage = 'Something went wrong. Please refresh the page.';
			}
		} catch (err) {
			errorMessage = 'Something went wrong. Please refresh the page.';
		}

		if (errorMessage) {
			error(500, errorMessage);
		}

		return data;
	}

	return {
		cosmetics: fetchCosmetics()
	};
};
