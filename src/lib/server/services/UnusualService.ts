import type { Unusual } from '$lib/types';
import unusuals from '$lib/server/data/unusuals.json';
import type { UnusualRepository } from '../repositories/UnusualRepository';
import { unusualRepository } from '../repositories/UnusualRepositoryPrisma';
import type { Dayjs } from 'dayjs';
import LogService from './LogService';

class UnusualService {
	private unusuals: Unusual[];
	private repo: UnusualRepository;

	constructor(repo: UnusualRepository) {
		this.unusuals = unusuals;
		this.repo = repo;
	}

	/**
	 * Returns all unusuals
	 * @returns array of all unusuals
	 */
	public getUnusuals() {
		return this.unusuals;
	}

	/**
	 * Returns the selected unusual for the given date
	 * @param date to get the unusual for
	 * @returns the unusual for the given date
	 */
	public async getUnusualByDay(date: Dayjs) {
		let unusual = await this.repo.findUnusual(date);

		if (!unusual) {
			unusual = await this.selectRandomUnusual();
		}

		return unusual;
	}

	/**
	 * Saves a random unusual that is set as the selected unusual
	 * for the current day
	 * @return the selected unusual
	 */
	private async selectRandomUnusual() {
		const randomIndex = Math.floor(Math.random() * this.unusuals.length);
		const randomRotation = Math.floor(Math.random() * 4) * 90;

		LogService.log(
			'Unusual',
			`Selected unusual: ${this.unusuals[randomIndex].name} with rotation ${randomRotation} degrees`
		);

		return this.repo.saveUnusualForCurrentDate(this.unusuals[randomIndex], randomRotation);
	}
}

export const unusualService = new UnusualService(unusualRepository);
