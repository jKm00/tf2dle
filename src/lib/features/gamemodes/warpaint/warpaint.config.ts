import { useStats } from '#lib/composables/useStats.ts';
import dayjs from '#lib/configs/dayjsConfig.ts';
import { PaintBucket } from '@lucide/svelte';
import type { Gamemode } from '../common/types';

export const details = {
	id: 'warpaint',
	name: 'Warpaint',
	href: '/warpaint',
	description: 'Guess the correct unusual effect',
	icon: PaintBucket,
	disabled: false,
	new: dayjs.utc().isBefore(dayjs.utc('2026-12-31'), 'day'),
	stats: useStats('warpaint')
} satisfies Gamemode;
