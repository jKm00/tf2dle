import type { Cosmetic } from '$lib/types';
import type { DailyCosmetics } from '@prisma/client';

export interface CosmeticRepository {
	findTodaysCosmetic(): Promise<DailyCosmetics | null>;

	saveTodaysCosmetic(cosmetic: Cosmetic, rotation: number): Promise<DailyCosmetics>;

	incrementNumberOfCorrectGuesses(): Promise<void>;
}
