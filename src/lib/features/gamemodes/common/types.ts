import type { UseStats } from '#lib/composables/useStats.ts';
import type { Icon, LucideProps } from '@lucide/svelte';
import type { Component } from 'svelte';

export type Gamemode = {
	id: string;
	name: string;
	href: string;
	description: string;
	icon: Component<LucideProps>;
	disabled: boolean;
	new: boolean;
	stats: UseStats;
};
