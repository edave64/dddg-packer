export type IFileInfo =
	| {
			name: string;
			isDir: false;
	  }
	| {
			name: string;
			isDir: true;
			children?: IFileInfo[];
	  };
