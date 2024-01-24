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
