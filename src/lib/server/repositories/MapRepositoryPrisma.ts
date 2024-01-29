import dayjs from '$lib/configs/dayjsConfig';
import { db } from '../prisma';
import type { MapRepository } from './MapRepository';

class MapRepositoryPrisma implements MapRepository {
	public async save(name: string, pos: { x: number; y: number }) {
		return await db.dailyMaps.create({
			data: {
				selectedAt: dayjs.utc().toDate(),
				name,
				startingPosX: pos.x,
				startingPosY: pos.y
			}
		});
	}

	public async getTodaysMap() {
		return await db.dailyMaps.findFirst({
			where: {
				selectedAt: dayjs.utc().toDate()
			}
		});
	}

	public async incrementTodaysNumberOfCorrectGuesses() {
		await db.dailyMaps.updateMany({
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

export const mapRepository = new MapRepositoryPrisma();
