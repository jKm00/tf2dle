import type { Dayjs } from 'dayjs';
import { db } from '#lib/server/prisma.ts';
import type { Warpaint } from '../types.ts';
import type { WarpaintRepository } from './WarpaintRepository.ts';

class WarpaintRepositoryPrisma implements WarpaintRepository {
	public async findWarpaint(date: Dayjs) {
		return db.dailyWarpaint.findFirst({
			where: { selectedAt: date.utc().startOf('day').toDate() }
		});
	}

	public async saveWarpaintForDate(warpaint: Warpaint, date: Dayjs) {
		const selectedAt = date.utc().startOf('day').toDate();
		// The existing schema has no unique date key. Serialize first selection across app instances.
		return db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(163, ${Math.floor(selectedAt.getTime() / 86400000)}::int)`;
			const existing = await tx.dailyWarpaint.findFirst({ where: { selectedAt } });
			return existing ?? tx.dailyWarpaint.create({ data: { selectedAt, name: warpaint.name } });
		});
	}

	public async incrementNumberOfCorrectGuesses(date: Dayjs) {
		await db.dailyWarpaint.updateMany({
			where: { selectedAt: date.utc().startOf('day').toDate() },
			data: { hasWon: { increment: 1 } }
		});
	}
}

export const warpaintRepository = new WarpaintRepositoryPrisma();
