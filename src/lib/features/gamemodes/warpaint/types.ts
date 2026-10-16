import type { GuessResponse } from '#lib/dtos.ts';

export type Crop = { x: number; y: number; width: number; height: number };

export type Warpaint = {
	name: string;
	image: string;
	collection: string;
	grade: string;
	wear: string;
	releaseDate: string;
	link: string;
	crop?: Crop;
};

export type WarpaintOption = { name: string; thumbnail: string };

export type WarpaintClues = {
	shortlist?: Array<{ name: string; ruledOut: boolean }>;
	collection?: string;
};

export type CurrentWarpaint = {
	warpaint: { thumbnail: string; crop: Crop };
	numberOfCorrectGuesses: number;
};

export type WarpaintComparison = {
	value: string;
	status: 'correct' | 'incorrect' | 'partial';
};

export type WarpaintFeedback = {
	collection: WarpaintComparison;
	grade: WarpaintComparison;
};

export interface WarpaintGuessResponse extends GuessResponse, WarpaintClues {
	name: string;
	thumbnail: string;
	feedback: WarpaintFeedback;
}

export const WARPAINT_HINTS = {
	largerCrop: 1,
	canvas: 2,
	fullImage: 3,
	shortlist: 4,
	collection: 5
} as const;
