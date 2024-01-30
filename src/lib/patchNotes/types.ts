export type PatchNote = {
	version: string;
	date: string;
	newFeatures: Change[];
	improvements: Change[];
	bugFixes: Change[];
};

export type Change = {
	title: string;
	description: string;
	gameMode: 'all' | 'weapon' | 'map';
};
