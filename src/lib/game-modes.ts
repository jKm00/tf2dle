import { Axe, GraduationCap, Map, Sparkles } from 'lucide-svelte';
import { useStats } from '$lib/composables/useStats';
import dayjs from './configs/dayjsConfig';

export const gameModes = [
	{
		name: 'Weapon',
		description: 'Guess the correct weapon',
		icon: Axe,
		disabled: false,
		new: false,
		stats: useStats('weapon')
	},
	{
		name: 'Map',
		description: 'Guess the correct map',
		icon: Map,
		disabled: false,
		new: false,
		stats: useStats('map')
	},
	{
		name: 'Cosmetic',
		description: 'Guess the correct cosmetic',
		icon: GraduationCap,
		disabled: false,
		new: false,
		stats: useStats('cosmetic')
	},
	{
		name: 'Unusual',
		description: 'Guess the correct unusual effect',
		icon: Sparkles,
		disabled: false,
		new: dayjs.utc().isBefore(dayjs.utc('2024-08-01'), 'day'),
		stats: useStats('unusual')
	}
];
