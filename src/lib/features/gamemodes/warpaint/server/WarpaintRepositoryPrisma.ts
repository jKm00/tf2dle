import type { Dayjs } from 'dayjs';
import { db } from '#lib/server/prisma.ts';
import type { Warpaint } from '../types.ts';
import type { WarpaintRepository } from './WarpaintRepository.ts';

class WarpaintRepositoryPrisma implements WarpaintRepository {
	public async findWarpaint(date: Dayjs) {
		return db.dailyWarpaint.findUnique({
			where: { selectedAt: date.utc().startOf('day').toDate() }
		});
	}

	public async saveWarpaintForDate(warpaint: Warpaint, date: Dayjs) {
		const selectedAt = date.utc().startOf('day').toDate();
		return db.dailyWarpaint.upsert({
			where: { selectedAt },
			create: { selectedAt, name: warpaint.name },
			// A no-op update uses the database upsert without changing an existing answer or wins.
			update: { selectedAt }
		});
	}

	public async incrementNumberOfCorrectGuesses(date: Dayjs) {
		await db.dailyWarpaint.update({
			where: { selectedAt: date.utc().startOf('day').toDate() },
			data: { hasWon: { increment: 1 } }
		});
	}
}

export const warpaintRepository = new WarpaintRepositoryPrisma();
