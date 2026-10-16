import type { CurrentWarpaint, WarpaintOption } from '#lib/features/gamemodes/warpaint/types.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	async function get<T>(url: string): Promise<T> {
		const response = await fetch(url);
		if (!response.ok) throw new Error('Could not load warpaint data');
		return response.json();
	}

	const yesterday = get<string>('/api/v1/game-modes/warpaint/yesterday').catch(() => null);
	const [current, options] = await Promise.allSettled([
		get<CurrentWarpaint>('/api/v1/game-modes/warpaint'),
		get<WarpaintOption[]>('/api/v1/warpaints')
	]);
	return {
		todaysWarpaint: current.status === 'fulfilled' ? current.value : null,
		warpaints: options.status === 'fulfilled' ? options.value : null,
		yesterdaysAnswer: yesterday
	};
};
