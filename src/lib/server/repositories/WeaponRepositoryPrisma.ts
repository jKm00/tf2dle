import dayjs from '$lib/configs/dayjsConfig';
import type { Weapon } from '$lib/types';
import type { Dayjs } from 'dayjs';
import { db } from '../prisma';
import type { WeaponRepository } from './WeaponRepository';

class WeaponRepositoryPrisma implements WeaponRepository {
	async incrementNumberOfCorrectGuesses(): Promise<void> {
		await db.dailyWeapons.updateMany({
			where: {
				selectedAt: dayjs.utc().toDate()
			},
			data: {
				hasWon: {
					increment: 1
				}
			}
		});
	}

	async getNumberOfCorrectGuesses(): Promise<number> {
		return await db.dailyWeapons
			.findFirst({
				where: {
					selectedAt: dayjs.utc().toDate()
				}
			})
			.then((weapon) => weapon?.hasWon ?? 0);
	}

	async getWeapon(date: Dayjs): Promise<string | null> {
		const weapon = await db.dailyWeapons.findFirst({
			where: {
				selectedAt: date.toDate()
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
