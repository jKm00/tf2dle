import { Axe, GraduationCap, Map, Sparkles, Sword } from 'lucide-svelte';
import { useStats } from '$lib/composables/useStats';
import dayjs from './configs/dayjsConfig';

export const gameModes = [
	{
		name: 'Weapon',
		href: '/weapon',
		description: 'Guess the correct weapon based on hints',
		icon: Axe,
		disabled: false,
		new: false,
		favorite: true,
		stats: useStats('weapon')
	},
	{
		name: 'Weapon 2',
		href: '/weapon-2',
		description: 'Guess the correct weapon based on weapon attributes',
		icon: Sword,
		disabled: false,
		new: dayjs.utc().isBefore(dayjs.utc('2024-12-01'), 'day'),
		favorite: false,
		stats: useStats('weapon2')
	},
	{
		name: 'Map',
		href: '/map',
		description: 'Guess the correct map',
		icon: Map,
		disabled: false,
		new: false,
		favorite: false,
		stats: useStats('map')
	},
	{
		name: 'Cosmetic',
		href: '/cosmetic',
		description: 'Guess the correct cosmetic',
		icon: GraduationCap,
		disabled: false,
		new: false,
		favorite: false,
		stats: useStats('cosmetic')
	},
	{
		name: 'Unusual',
		href: '/unusual',
		description: 'Guess the correct unusual effect',
		icon: Sparkles,
		disabled: false,
		new: dayjs.utc().isBefore(dayjs.utc('2024-08-01'), 'day'),
		favorite: false,
		stats: useStats('unusual')
	}
];
