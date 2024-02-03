import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	async function fetchHtml() {
		try {
			const res = await fetch('api/v1/test');
			const data = await res.text();

			if (!res.ok) {
				throw new Error(data);
			}

			return data;
		} catch (err) {
			error(500, `${err}`);
		}
	}

	return {
		html: fetchHtml()
	};
};

export const ssr = false;
