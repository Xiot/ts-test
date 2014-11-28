 declare class Uri {
	constructor(template?: string);
	replaceQueryParam(param: string, value: any);
}

module Services {
    


	export class SynergizeClientNode {

		private client: SynergizeClient;
		private $q: ng.IQService;

		constructor(client: SynergizeClient, $q) {
			this.client = client;

			this.links = {};
			this.items = [];

			this.$q = $q;

			this.activated = false;
		}

		public href: string;
		public activated: boolean;

		public rel: string;
		public contentType: string;
		public method: string;
		public title: string;
		public templates: string[];

		public data: any;

		public parent: SynergizeClientNode;

		public links: { [rel: string]: SynergizeClientNode };
		public items: Array<SynergizeClientNode>;

		public refresh(params?: any): ng.IPromise<any> {
			this.activated = false;
			return this.get(null, params);
		}

		//#region Search Methods

		public static _iteration: number = 0;

		public find(args: string[]): ng.IPromise<SynergizeClientNode> {

			var iteration = SynergizeClientNode._iteration++;

			var initialArgs = _.clone(args, true);

			var defer = this.$q.defer();

			//console.log('find [' + iteration + '] enter: ', initialArgs);
			this.findInternal(args).then(x => {
				//console.log('find [' + iteration + '] exit: ', initialArgs);
				//return x;
				defer.resolve(x);

			}).catch(x => {
					console.log("SynergizeClientNode.find Error:", x);
					//return x;
					defer.reject(x);
				});

			return defer.promise;
		}

		private findInternal(args: string[]): ng.IPromise<SynergizeClientNode> {

			if (!this.activated) {
				return this.get().then(x => {
					return x.find(args);
				});
			}

			if (args.length == 0) {
				return this.$q.when(this);
			}

			var first = args.shift();

			//if (Ext.String.StartsWith(first, "!")) {
			if (first[0] === "!") {
				var itemId = first.substring(1);

				var item = _.find(this.items, x => x.data.id === itemId);

				if (!item)
					return this.$q.reject("Unable to find the node.");

				return item.find(args);

			} else {

				if (this.links[first]) {
					return this.links[first].find(args);
				}
			}

			return this.$q.reject("Unable to find the node.");
		}
		//#endregion

		//#region Http Operations
		public get(rel?: string, params?: any): ng.IPromise<any> {

			var node = (rel && this.links[rel]) || this;

			return this.client.activateNode(node, params);
		}

		public put(data: any): ng.IPromise<any> {
			return null;
		}

		public post(data: any): ng.IPromise<any> {
			return null;
		}

		public delete(): ng.IPromise<any> {
			return null;
		}

		public patch(data: any): ng.IPromise<any> {
			return null;
		}
		//#endregion

		//#region Internal
		public resetActivated(): void {
			this.activated = false;
			_.forEach(this.items, x => x.resetActivated());
			_.forEach(this.links, x=> x.resetActivated());
		}
		//#endregion
	}

	export class SynergizeClient {

		public static $inject: string[] = ['$http', '$q', 'mutex', 'urlResolver', 'responseParser'];

		private httpClient: ng.IHttpService;
		private $q: ng.IQService;

		private mutex: Services.MutexService;
		private urlResolver: CoreServices.UrlResolver;

		private responseParser: Parsers.ResponseParserService;

        constructor(httpClient: ng.IHttpService, $q: ng.IQService, linkParser: Services.LinkParser, mutex: Services.MutexService, eventHub, urlResolver,
			responseParser: Parsers.ResponseParserService) {

			this.httpClient = httpClient;
			this.$q = $q;

			this.urlResolver = urlResolver;

			
			this.mutex = mutex;

			this.root = new SynergizeClientNode(this, this.$q);
			this.root.href = "/";

			this.responseParser = responseParser;


		}

		public find(args: string[]): ng.IPromise<SynergizeClientNode> {

			if (!args || args.length == 0 || (args.length === 1 && args[0] === "/"))
				return this.root.find([]);

			return this.root.find(args);
		}

		public root: SynergizeClientNode;

		public activateNode(node: Services.SynergizeClientNode, params?: any): ng.IPromise<SynergizeClientNode> {

			return this.mutex.lock(
				node.href,
				() => this.activateNodeInternal(node, params));
		}

		private setParams(href: string, params: any): string {
			//var u = new Uri(node.href);

			var url = href;

			if (params) {
				for (var propName in params) {

					var paramValue = params[propName];

					var beforeReplace = url;
					url = url.replace("{" + propName + "}", paramValue);

					if (beforeReplace === url) {
						var u = new Uri(url);
						u.replaceQueryParam(propName, paramValue);
						url = u.toString();
					}
				}
			}
			return url;
		}

		private activateNodeInternal(node: Services.SynergizeClientNode, params: any): ng.IPromise<SynergizeClientNode> {

			if (!node.href)
				return this.$q.reject("The href is not set.");

			if (node.activated)
				return this.$q.when(node);

			var defer = this.$q.defer();

			//console.log('ActivateNode: ' + node.href);

			if (params && Object.keys(params).length > 0) {
				var parentNode = node;
				node = new SynergizeClientNode(this, this.$q);
				node.parent = parentNode.parent;
				node.href = parentNode.href;
			}

			var url = this.setParams(node.href, params); 

			this.httpClient.get(url).then(x => {

				var result = this.responseParser.parse(x);

				node.href = x.config.url;
				node.data = result;
				node.links = {};
				node.items = [];

				if (result.links) {
					angular.forEach(result.links, x => {
						var linkNode = this.createClientFromLink(x);
						linkNode.parent = node;
						node.links[x.rel] = linkNode;
					});
				}

				if (result.items) {
					for (var i = 0; i < result.items.length; i++) {

						var responseItem = result.items[i];

						var itemClient = this.createClientFromItem(responseItem);
						itemClient.parent = node;
						node.items.push(itemClient);
					}
				}
				node.activated = true;
				defer.resolve(node);

			}).catch(x => {
					//TODO: This should still return a node that parses out the error information
					console.log('SynergizeClient Error:', x);
					defer.reject(x);
				});
			return defer.promise;
		}

		private createClientFromLink(link: Link): SynergizeClientNode {

			var linkClient = new SynergizeClientNode(this, this.$q);
			linkClient.href = link.href;

			//linkClient.parent = itemClient;
			linkClient.href = link.href;
			linkClient.rel = link.rel;
			linkClient.contentType = link.contentType;
			linkClient.title = link.title;
			linkClient.templates = link.templates;

			return linkClient;

		}

		private createClientFromItem(item: any): SynergizeClientNode {
			var itemClient = new SynergizeClientNode(this, this.$q);
			itemClient.href = item.href;
			itemClient.data = item;

			if (item.links) {
				angular.forEach(item.links, itemChildNode => {
					var nodeClient = this.createClientFromLink(itemChildNode);
					nodeClient.parent = itemClient;
					itemClient.links[itemChildNode.rel] = nodeClient;
				});
			}

			return itemClient;
		}
	}
} 