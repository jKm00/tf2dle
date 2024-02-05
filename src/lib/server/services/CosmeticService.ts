import type { Cosmetic } from '$lib/types';
import cosmetics from '$lib/server/data/cosmetics.json';
import type { CosmeticRepository } from '$lib/server/repositories/CosmeticRepository';
import { cosmeticRepository } from '$lib/server/repositories/CosmeticRepositoryPrisma';
import type { DailyCosmetics } from '@prisma/client';

class CosmeticService {
	private cosmetics: Cosmetic[];
	private repo: CosmeticRepository;

	constructor(repo: CosmeticRepository) {
		this.cosmetics = cosmetics;
		this.repo = repo;
	}

	public getCosmetics() {
		return this.cosmetics;
	}

	public async getTodaysCosmetic() {
		let cosmetic = await this.repo.findTodaysCosmetic();

		if (!cosmetic) {
			cosmetic = await this.selectRandomCosmetic();
		}

		return cosmetic;
	}

	private async selectRandomCosmetic() {
		const randomIndex = Math.floor(Math.random() * this.cosmetics.length);
		const randomRotation = Math.floor(Math.random() * 4) * 90;

		return this.repo.saveTodaysCosmetic(this.cosmetics[randomIndex], randomRotation);
	}

	public async validateGuess(guess: string, numberOfGuesses: number) {
		const todaysCosmetic = await this.getTodaysCosmetic();
		const guessedCosmetic = this.cosmetics.find((cosmetic) => cosmetic.name === guess);

		let usedBy: string | undefined;
		if (numberOfGuesses >= 15) {
			usedBy = todaysCosmetic.usedBy;
		}

		const correct = guess === todaysCosmetic.name;

		if (correct) {
			await this.repo.incrementNumberOfCorrectGuesses();
		}

		return {
			name: guessedCosmetic?.name ?? '',
			thumbnail: guessedCosmetic?.image ?? '',
			correct: correct,
			usedBy
		};
	}
}

export const cosmeticService = new CosmeticService(cosmeticRepository);
