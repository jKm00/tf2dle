import type { Weapon } from '$lib/types';
import weapons from '$lib/server/data/weapons.json';
import { weaponTwoRepository } from '../repositories/WeaponTwoRepositoryPrisma';
import type { WeaponTwoRepository } from '../repositories/WeaponTwoRepository';
import type { Dayjs } from 'dayjs';
import LogService from './LogService';
import dayjs from '$lib/configs/dayjsConfig';

class WeaponTwoService {
	private weapons: Weapon[];
	private repo: WeaponTwoRepository;

	constructor(repository: WeaponTwoRepository) {
		this.weapons = weapons.filter((weapon) => weapon.attributes.length > 1) as Weapon[];
		this.repo = repository;
	}

	/**
	 * Returns a list of attributes for the selected weapon for
	 * the specified date
	 * @param date to get the weapon for
	 */
	public async getWeaponByDay(date: Dayjs) {
		let weapon = await this.repo.findWeapon(date);

		if (!weapon) {
			weapon = await this.selectRandomWeapon();
		}

		const foundWeapon = this.weapons.find((w) => w.name === weapon.name);

		return {
			...foundWeapon!,
			hasWon: weapon.hasWon
		};
	}

	/**
	 * Saves a random weapon that is set as the selected weapon
	 * for the current day
	 * @returns the selected weapon
	 */
	private async selectRandomWeapon() {
		const randomIndex = Math.floor(Math.random() * this.weapons.length);

		const selectedWeapon = this.weapons[randomIndex];

		LogService.log('WeaponTwo', `Selected weapon: ${selectedWeapon.name}`);

		return this.repo.saveWeaponForCurrentDate(selectedWeapon);
	}

	/**
	 * Validates a guess
	 * @param guess the guess to validate
	 * @param tries number of tries the user has made
	 * @returns if the guess was correct. It correct all attributes are returned,
	 * otherwise attributes based on number of tries are returned (gives the user
	 * more hints for each try)
	 */
	public async validateGuess(guess: string, tries: number) {
		const currentTime = dayjs.utc();

		const todaysWeapon = await this.getWeaponByDay(currentTime);
		const correct = todaysWeapon.name === guess;

		if (correct) {
			await this.repo.incrementNumberOfCorrectGuesses(currentTime);
		}

		const shouldSlice = !correct && tries < todaysWeapon.attributes.length - 1;

		return {
			name: guess,
			correct,
			guessedAt: currentTime.format(),
			attributes: shouldSlice
				? todaysWeapon.attributes.slice(1, tries + 2)
				: todaysWeapon.attributes.slice(1)
		};
	}
}

export const weaponTwoService = new WeaponTwoService(weaponTwoRepository);
