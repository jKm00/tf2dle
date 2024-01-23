export type Map = {
	name: string;
	gameModes: string[];
	releaseDate: string;
	image: string;
	thumbnail: string;
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
