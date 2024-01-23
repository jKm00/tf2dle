export type Map = {
	name: string;
	thumbnail: string;
	image: string;
	gameModes: string[];
	releaseDate: string;
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
	gameModes: string[];
	releaseDate: string;
};
