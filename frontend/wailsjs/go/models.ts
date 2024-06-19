export namespace main {
	
	export class Author {
	    reddit: string;
	    twitter: string;
	    github: string;
	    website: string;
	    pixiv: string;
	    deviantart: string;
	    patreon: string;
	    facebook: string;
	    discord: string;
	
	    static createFrom(source: any = {}) {
	        return new Author(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.reddit = source["reddit"];
	        this.twitter = source["twitter"];
	        this.github = source["github"];
	        this.website = source["website"];
	        this.pixiv = source["pixiv"];
	        this.deviantart = source["deviantart"];
	        this.patreon = source["patreon"];
	        this.facebook = source["facebook"];
	        this.discord = source["discord"];
	    }
	}
	export class Pack {
	    id: string;
	    name: string;
	    source: string;
	    description: string;
	    dddg1Path: string;
	    dddg2Path: string;
	    preview: string[];
	    characters: string[];
	    authors: string[];
	    kind: string[];
	
	    static createFrom(source: any = {}) {
	        return new Pack(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.source = source["source"];
	        this.description = source["description"];
	        this.dddg1Path = source["dddg1Path"];
	        this.dddg2Path = source["dddg2Path"];
	        this.preview = source["preview"];
	        this.characters = source["characters"];
	        this.authors = source["authors"];
	        this.kind = source["kind"];
	    }
	}
	export class MultiRepoJson {
	    packs: Pack[];
	    authors: {[key: string]: Author};
	
	    static createFrom(source: any = {}) {
	        return new MultiRepoJson(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.packs = this.convertValues(source["packs"], Pack);
	        this.authors = this.convertValues(source["authors"], Author, true);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

