module Services.Parsers {
    export class GitHubParser implements IResponseParser {
        public canParse(response: IHttpResponse): boolean {

            return response.config.url.indexOf('api.github.com') > 0;
            //var ghHeader = response.headers('X-GitHub-Media-Type');
            //return ghHeader === 'github.v3';
        }

        public parse(response: IHttpResponse, options: IResourceOptions): Resource {
            var opt =<IResourceOptions>_.extend({}, options, { url: response.config.url });
            var resource = new Resource(opt);
            this.populate(resource, response);
            return resource;
        }

        public populate(resource: Resource, response: IHttpResponse): void {

	        this._populateInternal(resource, response.data);
        }

		private _populateInternal(resource: Resource, data: any) : void {
			var props: { [name: string]: any } = {};
			var links: { [name: string]: ResourceLink } = {};

			if (angular.isArray(data)) {
				//props['data'] = data;

				_.forEach(data, v => {

					var innerOpt = <IResourceOptions>_.extend({}, resource._options, { parent: resource });
					var item = new Resource(innerOpt);
					this._populateInternal(item, v);


					resource.items.push(item);
				});

			} else {

				_.forEach(data, (value, key) => {

					if (this.endsWith(key, '_url')) {

						var link = new ResourceLink(resource._options);
						link.rel = key;
						link.href = <string> value;

						if (value) {
							URI.expand(<string>value, g => {
								link.params.push(g);
							});
						}

						links[key] = link;
					} else {
						props[key] = value;
					}
				});
			}

			resource.links = links;
			resource.props = props;
		}

        private endsWith(left: string, right: string) {
            return left.lastIndexOf(right) === (left.length - right.length);
        }
    }
} 