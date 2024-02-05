export type SelectedMapDto = {
	image: {
		url: string;
		startingPos: {
			x: number;
			y: number;
		};
	};
	correctGuesses: number;
};

export type MapDto = {
	name: string;
	thumbnail: string;
};

export type MapGuessResponse = {
	correct: boolean;
	name: {
		status: 'correct' | 'incorrect';
		value: string;
	};
	gameModes: {
		status: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
	releaseDate: {
		status: 'correct' | 'earlier' | 'later';
		value: number;
	};
	thumbnail: string;
};

export type WeaponGuessResponse = {
	correct: boolean;
	name: string;
	numberOfCorrectGuesses: number;
	releaseDate: {
		status: 'correct' | 'earlier' | 'later';
		value: string;
	};
	usedBy: {
		status: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
	slot: {
		status: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
	magazineSize: {
		status: 'correct' | 'incorrect';
		value: string;
	};
	qualities: {
		status: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
};

export type CosmeticDto = {
	name: string;
	thumbnail: string;
};

export type CosmeticGuessResponse = {
	name: string;
	thumbnail: string;
	correct: boolean;
	usedBy?: string;
};

export type CurrentCosmeticDto = {
	cosmetic: {
		thumbnail: string;
		rotation: number;
	};
	numbersOfCorrectGuesses: number;
};
