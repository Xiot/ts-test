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

            var props : {[name: string]: any} = {};
            var links: { [name: string]: ResourceLink } = {};

            _.forEach(response.data, (value, key) => {

                if (this.endsWith(key, '_url')) {

                    var link = new ResourceLink(resource._options.http, resource);
                    link.rel = key;
                    link.href =<string> value;

                    var r = new RegExp('{/?([^}]+)}', 'g');
                    var match = null;

                    var i = 0;

                    var t = URI.expand(<string>value, g => {
                        link.params.push(g);
                    });

                    //while ((match = r.exec(<string>value)) !== null) {
                    //    link.params.push(match[1]);
                    //    if (i++ >= 5)
                    //        break;
                    //}
                    links[key] = link;
                } else {
                    props[key] = value;
                }
            });
            resource.links = links;
            resource.props = props;
        }
        private endsWith(left: string, right: string) {
            return left.lastIndexOf(right) === (left.length - right.length);
        }
    }
} 