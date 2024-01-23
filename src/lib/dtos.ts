export type SelectedMapDto = {
	image: {
		url: string;
		startingPos: {
			x: number;
			y: number;
		};
	};
	hints: string[];
};

export type MapDto = {
	name: string;
	thumbnail: string;
};
