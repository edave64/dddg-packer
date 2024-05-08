export interface IRepo {
	$schema: "https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/repo_schema.json";
	pack?: IPack;
	packs?: IPack[];
	authors: {
		[key: string]: IAuthor;
	};
}

export interface ISupportedRepo {
	$schema: "https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/repo_schema.json";
	pack: IPack;
	authors: {
		[key: string]: IAuthor;
	};
}

export interface IPack {
	id: string;
	name: string;
	dddg1Path?: string;
	dddg2Path?: string;
	characters: string[];
	authors: string[];
}

export interface IAuthor {
	reddit?: string;
}
