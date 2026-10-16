import type { Dayjs } from 'dayjs';
import type { DailyWarpaint } from '#lib/server/generated/prisma/browser.ts';
import type { Warpaint } from '../types.ts';

export interface WarpaintRepository {
	findWarpaint(date: Dayjs): Promise<DailyWarpaint | null>;
	saveWarpaintForDate(warpaint: Warpaint, date: Dayjs): Promise<DailyWarpaint>;
	incrementNumberOfCorrectGuesses(date: Dayjs): Promise<void>;
}
