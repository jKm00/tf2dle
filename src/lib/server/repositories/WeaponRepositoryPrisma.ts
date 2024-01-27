import dayjs from '$lib/configs/dayjsConfig';
import type { Weapon } from '$lib/types';
import { db } from '../prisma';
import type { WeaponRepository } from './WeaponRepository';

class WeaponRepositoryPrisma implements WeaponRepository {
	async getTodaysWeapon(): Promise<string | null> {
		const weapon = await db.dailyWeapons.findFirst({
			where: {
				selectedAt: dayjs.utc().toDate()
			}
		});

		if (!weapon) {
			return null;
		}

		return weapon.name;
	}

	async save(weapon: Weapon) {
		await db.dailyWeapons.create({
			data: {
				selectedAt: dayjs.utc().toDate(),
				name: weapon.name,
				hasWon: 0
			}
		});
	}
}

export const weaponRepository = new WeaponRepositoryPrisma();
