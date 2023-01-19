export namespace main {
	
	export class DfuFlashResponse {
	    success: boolean;
	    output: string;
	
	    static createFrom(source: any = {}) {
	        return new DfuFlashResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.output = source["output"];
	    }
	}
	export class ErrorWrapper {
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new ErrorWrapper(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	    }
	}
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
	export class FetchedReleases {
	    error?: ErrorWrapper;
	    releases: ReleaseMeta[];
	
	    static createFrom(source: any = {}) {
	        return new FetchedReleases(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = this.convertValues(source["error"], ErrorWrapper);
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
	export class Target {
	    label: string;
	    value: string;
	    prefix: string;
	
	    static createFrom(source: any = {}) {
	        return new Target(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.label = source["label"];
	        this.value = source["value"];
	        this.prefix = source["prefix"];
	    }
	}
	export class FetchedTargets {
	    error?: ErrorWrapper;
	    targets: Target[];
	    changelog: string;
	
	    static createFrom(source: any = {}) {
	        return new FetchedTargets(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = this.convertValues(source["error"], ErrorWrapper);
	        this.targets = this.convertValues(source["targets"], Target);
	        this.changelog = source["changelog"];
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

