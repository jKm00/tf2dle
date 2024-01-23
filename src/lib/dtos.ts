export type SelectedMapDto = {
	image: {
		url: string;
		startingPos: {
			x: number;
			y: number;
		};
	};
};

export type MapDto = {
	name: string;
	thumbnail: string;
};

export type MapGuessResponse = {
	correct: boolean;
	name: string;
	gameModes: {
		correct: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
	releaseDate: {
		correct: 'correct' | 'earlier' | 'later';
		value: number;
	};
	thumbnail: string;
};
