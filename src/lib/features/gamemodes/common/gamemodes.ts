import { Axe, GraduationCap, Map, Sparkles, Sword } from '@lucide/svelte';
import { useStats } from '#lib/composables/useStats.ts';
import dayjs from '#lib/configs/dayjsConfig.ts';
import { details as warpaintDetails } from '../warpaint/warpaint.config';
import type { Gamemode } from './types';

export const gameModes: Gamemode[] = [
	{
		id: 'weapon',
		name: 'Weapon',
		href: '/weapon',
		description: 'Guess the correct weapon based on hints',
		icon: Axe,
		disabled: false,
		new: false,
		stats: useStats('weapon')
	},
	{
		id: 'weapon_2',
		name: 'Weapon 2',
		href: '/weapon-2',
		description: 'Guess the correct weapon based on weapon attributes',
		icon: Sword,
		disabled: false,
		new: dayjs.utc().isBefore(dayjs.utc('2024-12-01'), 'day'),
		stats: useStats('weapon_2')
	},
	{
		id: 'map',
		name: 'Map',
		href: '/map',
		description: 'Guess the correct map',
		icon: Map,
		disabled: false,
		new: false,
		stats: useStats('map')
	},
	{
		id: 'cosmetic',
		name: 'Cosmetic',
		href: '/cosmetic',
		description: 'Guess the correct cosmetic',
		icon: GraduationCap,
		disabled: false,
		new: false,
		stats: useStats('cosmetic')
	},
	{
		id: 'unusual',
		name: 'Unusual',
		href: '/unusual',
		description: 'Guess the correct unusual effect',
		icon: Sparkles,
		disabled: false,
		new: dayjs.utc().isBefore(dayjs.utc('2024-08-01'), 'day'),
		stats: useStats('unusual')
	},
	warpaintDetails
];
