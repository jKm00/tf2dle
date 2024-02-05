import dayjs from '$lib/configs/dayjsConfig';
import type { Cosmetic } from '$lib/types';
import { db } from '../prisma';
import type { CosmeticRepository } from './CosmeticRepository';

class CosmeticRepositoryPrisma implements CosmeticRepository {
	public async findTodaysCosmetic() {
		return await db.dailyCosmetics.findFirst({
			where: {
				selectedAt: dayjs.utc().toDate()
			}
		});
	}

	public async saveTodaysCosmetic(cosmetic: Cosmetic, rotation: number) {
		return await db.dailyCosmetics.create({
			data: {
				selectedAt: dayjs.utc().toDate(),
				name: cosmetic.name,
				thumbnail: cosmetic.image,
				rotation: rotation,
				usedBy: cosmetic.usedBy
			}
		});
	}

	public async incrementNumberOfCorrectGuesses() {
		await db.dailyCosmetics.updateMany({
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
}

export const cosmeticRepository = new CosmeticRepositoryPrisma();
