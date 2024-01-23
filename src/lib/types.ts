export type Map = {
	name: string;
	gameMode: string;
	releaseDate: string;
	imgUrl: string;
};

export type SelectedMap = {
	name: string;
	image: {
		url: string;
		startingPos: {
			x: number;
			y: number;
		};
	};
	hints: string[];
};
