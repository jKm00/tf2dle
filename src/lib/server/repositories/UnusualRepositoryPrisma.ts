import type { Unusual } from '$lib/types';
import type { DailyUnusuals } from '@prisma/client';
import type { Dayjs } from 'dayjs';
import type { UnusualRepository } from './UnusualRepository';
import { db } from '../prisma';
import dayjs from '$lib/configs/dayjsConfig';

class UnusualRepositoryPrisma implements UnusualRepository {
	public async findUnusual(date: Dayjs) {
		return await db.dailyUnusuals.findFirst({
			where: {
				selectedAt: date.toDate()
			}
		});
	}

	public async saveUnusualForCurrentDate(unusual: Unusual, rotation: number) {
		return await db.dailyUnusuals.create({
			data: {
				selectedAt: dayjs.utc().toDate(),
				name: unusual.name,
				thumbnail: unusual.image,
				rotation,
				series: unusual.series
			}
		});
	}
	incrementNumberOfCorrectGuesses(date: Dayjs): Promise<void> {
		throw new Error('Method not implemented.');
	}
}

export const unusualRepository = new UnusualRepositoryPrisma();
