
/**
 * Resource
 *  - links : ResourceLink[]
 *  - items : ResourceItem[]
 *  - meta : MetaInformation
 */

module Services {

    // TODO: create an options object to pass to the parers
    // and between the objects if needed

    export interface IHttpResponse extends ng.IHttpPromiseCallbackArg<any> { }

    export interface IResponseParser {
        canParse(response: IHttpResponse): boolean;
        parse(response: IHttpResponse, options: IResourceOptions): Resource;
        populate(resource: Resource, response: IHttpResponse) : void;
        //(response: ng.IHttpPromiseCallbackArg<any>): Resource;
    }

    export interface IResourceParser {
        //(response: IHttpResponse, options: IResourceOptions): Resource;
        create(response: IHttpResponse, options: IResourceOptions): Resource;
        populate(resource: Resource, response: IHttpResponse): void;
    }

    export class ResourceParserFactory implements IResourceParser {
        public parsers: IResponseParser[] = [];

        public create(response: IHttpResponse): Resource {
            var parser = this.getParserFor(response);
            return parser.parse(response, null);
        }

        public populate(resource: Resource, response: IHttpResponse): void {
            var parser = this.getParserFor(response);
            parser.populate(resource, response);
        }

        private getParserFor(response: IHttpResponse): IResponseParser {
            var first = _.find(this.parsers, x => {
                return x.canParse(response);
            });

            if (!first)
                throw new Error('Unable to parse.');

            return first;
        }
}

    export interface IResourceOptions {
        parser: IResourceParser;
        http: ng.IHttpService;
        parent?: Resource;
        url: string;
    }

    export class RootResource {

        private _options: IResourceOptions;
        constructor(options: IResourceOptions) {
            this._options = options;
        }

        public follow(path: string[]): BreadcrumbLink {
            return null;
        }
        public get(): ng.IPromise<Resource> {

            return this._options.http.get('/').then(res => {
                var o = _.clone(this._options);
                return this._options.parser.create(res, o);
            });
        }
    }

    export class Resource {

        public _options: IResourceOptions;
        
        constructor(options: IResourceOptions) {
            this._options = options;
            this.href = this._options.url;
        }

        public id: string;
        public href: string;

		public links: { [rel: string]: ResourceLink };
		public items: Resource[] = [];

        public activated: boolean;
        public props : {[name: string]: any};

        public follow(path: Array<string>): BreadcrumbLink {
            return null;
        }

        public activate(): ng.IPromise<any> {
            
            return this._options.http.get(this.href).then(x => {
                this.parse(x);
                this.activated = true;
                return this;
            });
        }

        private parse(response: IHttpResponse): void {
            this._options.parser.populate(this, response);
        }
    }

    export class ResourceItem {

        public id: string;
        public href: string;
        public links: { [rel: string]: ResourceLink };

        public self: ResourceLink;

        // TODO: need to take the meta from the parent to de-reference templated 
        // links lazily

    }

    // lazily loaded list of links to follow on activation
    export class BreadcrumbLink {

    }

    export class ResourceLink {

        private _parent: Resource;
        private _http: ng.IHttpService;
        private _parser: IResourceParser;

        constructor(options : IResourceOptions) {
            this._http = options.http;
			this._parent = options.parent;
	        this._parser = options.parser;
            this.params = [];
        }

        public href: string;
        public rel: string;
        public contentType: string;
        public method: string;
        public title: string;

        public params: string[];

        public get(params: any): ng.IPromise<Resource> {
            
            var uri = this.url(params);

            return this._http.get(uri).then(res => {

                var resource = new Resource({
                    http: this._http,
                    parent: this._parent,
                    parser: this._parser,
                    url: uri
                });

                this._parser.populate(resource, res);
                return resource;
            });
        }
        public post(object: any): ng.IPromise<Resource> {
            return null;
        }



        public url(values: any): string {

            if (!this.params || this.params.length === 0)
                return this.href;

            values = values || {};
            _.forEach(this.params, p => {
                if (values[p] === undefined)
                    values[p] = null;
            });

            var uri = URI.expand(this.href, values).toString();
            return uri;
        }
    }
} 