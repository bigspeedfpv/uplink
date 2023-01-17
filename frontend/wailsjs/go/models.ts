export namespace main {
	
	export class ReleaseMeta {
	    label: string;
	    codename: string;
	    value: string;
	    date: string;
	    browserDownloadUrl: string;
	    releaseNotes: string;
	    latest: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ReleaseMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.label = source["label"];
	        this.codename = source["codename"];
	        this.value = source["value"];
	        this.date = source["date"];
	        this.browserDownloadUrl = source["browserDownloadUrl"];
	        this.releaseNotes = source["releaseNotes"];
	        this.latest = source["latest"];
	    }
	}
	export class FetchedReleasesError {
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new FetchedReleasesError(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	    }
	}
	export class FetchedReleases {
	    error?: FetchedReleasesError;
	    releases: ReleaseMeta[];
	
	    static createFrom(source: any = {}) {
	        return new FetchedReleases(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = this.convertValues(source["error"], FetchedReleasesError);
	        this.releases = this.convertValues(source["releases"], ReleaseMeta);
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

