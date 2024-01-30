export type PatchNote = {
	version: string;
	date: string;
	changes: Change[];
};

export type Change = {
	title: string;
	description: string;
	gameMode: 'all' | 'weapon' | 'map';
	tag: 'feature' | 'improvment' | 'bugfix';
};
