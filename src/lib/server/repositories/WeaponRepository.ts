import type { Weapon } from '$lib/types';

export interface WeaponRepository {
	getTodaysWeapon(): Promise<string | null>;

	save(weapon: Weapon): Promise<void>;
}
