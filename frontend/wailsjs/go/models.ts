export namespace backend {
	
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
	export class Script {
	    name: string;
	    description: string;
	    filename: string;
	    unpack_to: string;
	    unpack_from: string;
	    info_url: string;
	    default: boolean;
	    official: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Script(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.filename = source["filename"];
	        this.unpack_to = source["unpack_to"];
	        this.unpack_from = source["unpack_from"];
	        this.info_url = source["info_url"];
	        this.default = source["default"];
	        this.official = source["official"];
	    }
	}
	export class Language {
	    language: string;
	    name: string;
	    description: string;
	    directory: string;
	
	    static createFrom(source: any = {}) {
	        return new Language(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.language = source["language"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.directory = source["directory"];
	    }
	}
	export class FetchPacksResponse {
	    languages: Language[];
	    scripts: Script[];
	    error?: ErrorWrapper;
	
	    static createFrom(source: any = {}) {
	        return new FetchPacksResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.languages = this.convertValues(source["languages"], Language);
	        this.scripts = this.convertValues(source["scripts"], Script);
	        this.error = this.convertValues(source["error"], ErrorWrapper);
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
	
	
	export class SaveFirmwareStatus {
	    status: number;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveFirmwareStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.status = source["status"];
	        this.path = source["path"];
	    }
	}
	

}

export namespace config {
	
	export class Config {
	    dark: boolean;
	    expert: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dark = source["dark"];
	        this.expert = source["expert"];
	    }
	}

}

