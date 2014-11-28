
/**
 * Resource
 *  - links : ResourceLink[]
 *  - items : ResourceItem[]
 *  - meta : MetaInformation
 */

module Services {

    // TODO: create an options object to pass to the parers
    // and between the objects if needed

    export interface IResourceParser {
        (response: ng.IHttpPromiseCallbackArg<any>): Resource;
    }

    export class Resource {

        public id: string;
        public href: string;
        public links: { [rel: string]: ResourceLink };
        public activated: boolean;

        public follow(path: Array<string>): BreadcrumbLink {
            return null;
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

        constructor($http, parent: Resource) {
            this._http = $http;
            this._parent = parent;
        }

        public href: string;
        public rel: string;
        public contentType: string;
        public method: string;
        public title: string;

        public get(params: any): ng.IPromise<Resource> {

            var uri = URI.expand(this.href, params).toString();
            return this._http.get(uri).then(res => {
                return this._parser(res);                
            });

            return null;
        }
        public post(object: any): ng.IPromise<Resource> {
            return null;
        }
    }
} 