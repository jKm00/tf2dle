import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	async function fetchWeapons() {
		let res;
		let data;
		let errorMessage: string | null = null;

		try {
			res = await fetch('/api/v1/weapons');
			data = (await res.json()) as string[];

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
		weapons: fetchWeapons()
	};
};
