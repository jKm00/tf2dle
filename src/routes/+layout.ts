export const load = async ({ fetch }) => {
	async function fetchNextReset() {
		try {
			const res = await fetch('/api/v1/game-modes/next-reset');
			const data = (await res.json()) as string;

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	return {
		nextReset: await fetchNextReset()
	};
};
