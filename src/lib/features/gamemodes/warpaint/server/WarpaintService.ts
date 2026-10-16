import type { Dayjs } from 'dayjs';
import dayjs from '#lib/configs/dayjsConfig.ts';
import { generateRandomNumber } from '#lib/server/utils.ts';
import {
	WARPAINT_HINTS,
	type Warpaint,
	type WarpaintClues,
	type WarpaintFeedback,
	type WarpaintGuessResponse
} from '../types.ts';
import type { WarpaintRepository } from './WarpaintRepository.ts';
import { warpaintRepository } from './WarpaintRepositoryPrisma.ts';
import warpaints from './warpaints.data.json';

export class WarpaintService {
	constructor(
		private repo: WarpaintRepository,
		private paints: Warpaint[] = warpaints
	) {}

	public getWarpaints() {
		return this.paints.map(({ name, image }) => ({ name, thumbnail: image }));
	}

	public async getWarpaintByDay(date: Dayjs) {
		const daily =
			(await this.repo.findWarpaint(date)) ??
			(await this.repo.saveWarpaintForDate(
				this.paints[generateRandomNumber(this.paints.length)],
				date
			));
		const paint = this.paints.find(({ name }) => name === daily.name);
		if (!paint) throw new Error('Selected warpaint is missing from the dataset');
		return { daily, paint };
	}

	public async getCurrentWarpaint() {
		const { daily, paint } = await this.getWarpaintByDay(dayjs.utc());
		return {
			warpaint: {
				thumbnail: paint.image,
				crop: paint.crop ?? { x: 0.32, y: 0.29, width: 0.18, height: 0.18 }
			},
			numberOfCorrectGuesses: daily.hasWon
		};
	}

	public async play(guess: string, attempt: number): Promise<WarpaintGuessResponse | null> {
		const guessedPaint = this.paints.find(({ name }) => name === guess);
		if (!guessedPaint) return null;

		const now = dayjs.utc();
		const { paint } = await this.getWarpaintByDay(now);
		const correct = guessedPaint.name === paint.name;
		if (correct) await this.repo.incrementNumberOfCorrectGuesses(now);

		return {
			name: guessedPaint.name,
			thumbnail: guessedPaint.image,
			correct,
			guessedAt: now.format(),
			...this.getClues(paint, now, attempt),
			feedback: this.getFeedback(guessedPaint, paint)
		};
	}

	private getFeedback(guess: Warpaint, answer: Warpaint): WarpaintFeedback {
		return {
			collection: {
				value: guess.collection,
				status: guess.collection === answer.collection ? 'correct' : 'incorrect'
			},
			grade: {
				value: guess.grade,
				status: guess.grade === answer.grade ? 'correct' : 'incorrect'
			}
		};
	}

	private getClues(paint: Warpaint, date: Dayjs, attempt: number): WarpaintClues {
		if (attempt < WARPAINT_HINTS.shortlist) return {};
		const seed = `${date.format('YYYY-MM-DD')}:${paint.name}`;
		const rank = (name: string) => {
			let hash = 2166136261;
			for (const char of `${seed}:${name}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
			return hash >>> 0;
		};
		const similarity = (candidate: Warpaint) =>
			Number(candidate.collection === paint.collection) * 2 +
			Number(candidate.grade === paint.grade);
		const candidates = this.paints
			.filter(({ name }) => name !== paint.name)
			.sort((a, b) => similarity(b) - similarity(a) || rank(a.name) - rank(b.name));
		// Mix collections so the final collection clue can eliminate plausible choices.
		const preferred = [
			...candidates.filter((candidate) => candidate.collection === paint.collection).slice(0, 3),
			...candidates
				.filter(
					(candidate) =>
						candidate.collection !== paint.collection && candidate.grade === paint.grade
				)
				.slice(0, 2)
		];
		const distractors = [...new Set([...preferred, ...candidates])].slice(0, 5);
		return {
			shortlist: [paint, ...distractors]
				.sort((a, b) => rank(a.name) - rank(b.name))
				.map((candidate) => ({
					name: candidate.name,
					ruledOut:
						attempt >= WARPAINT_HINTS.collection && candidate.collection !== paint.collection
				})),
			...(attempt >= WARPAINT_HINTS.collection ? { collection: paint.collection } : {})
		};
	}

	public async getYesterdaysAnswer() {
		const { paint } = await this.getWarpaintByDay(dayjs.utc().subtract(1, 'day'));
		return paint.name;
	}
}

export const warpaintService = new WarpaintService(warpaintRepository);
