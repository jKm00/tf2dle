export type Map = {
	name: string;
	gameMode: string;
	releaseDate: string;
	imgUrl: string;
};

export type SelectedMap = {
	map: Map;
	startingPos: {
		x: number;
		y: number;
	};
};
