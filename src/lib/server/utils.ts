import { randomInt } from 'node:crypto';

export function generateRandomNumber(max: number) {
	return randomInt(max);
}
