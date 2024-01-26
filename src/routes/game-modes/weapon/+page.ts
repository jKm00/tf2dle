import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	async function fetchTodaysWeapon() {
		const res = await fetch('/api/v1/game-modes/weapon');
		const data = (await res.json()) as string;

		return data;
		error(500, {
			message: 'Something went wrong. Please refresh the page.'
		});
	}

	return {
		todaysWeapon: fetchTodaysWeapon()
	};
};
