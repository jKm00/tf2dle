import type { Cosmetic } from '$lib/types';
import cosmetics from '$lib/server/data/cosmetics.json';
import type { CosmeticRepository } from '$lib/server/repositories/CosmeticRepository';
import { cosmeticRepository } from '$lib/server/repositories/CosmeticRepositoryPrisma';
import type { CosmeticGuessResponse } from '$lib/dtos';

/**
 * Service for handling cosmetics
 */
class CosmeticService {
	private cosmetics: Cosmetic[];
	private repo: CosmeticRepository;

	constructor(repo: CosmeticRepository) {
		this.cosmetics = cosmetics;
		this.repo = repo;
	}

	/**
	 * Returns all cosmetics
	 * @returns all cosmetics
	 */
	public getCosmetics() {
		return this.cosmetics;
	}

	/**
	 * Returns the cosmetic that is selected for the current day
	 * @returns cosmetic for the current day
	 */
	public async getTodaysCosmetic() {
		let cosmetic = await this.repo.findTodaysCosmetic();

		if (!cosmetic) {
			cosmetic = await this.selectRandomCosmetic();
		}

		return cosmetic;
	}

	/**
	 * Selects a random cosmetic that is used for the current day
	 * @returns the selected cosmetic
	 */
	private async selectRandomCosmetic() {
		const randomIndex = Math.floor(Math.random() * this.cosmetics.length);
		const randomRotation = Math.floor(Math.random() * 4) * 90;

		return this.repo.saveTodaysCosmetic(this.cosmetics[randomIndex], randomRotation);
	}

	/**
	 * Validates a guess
	 * @param guess the guess to validate
	 * @param numberOfGuesses the number of tries the user has made
	 * @returns an object containing information about the guess and if it was correct.
	 * A hint is provided if the user has made 15 or more guesses
	 */
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
