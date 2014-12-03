module Controllers {
    export class ExplorerController {
        constructor(root: Services.Resource) {

            this.active = root;
        }

		public active: Services.Resource;

		public activate(link: Services.ResourceLink): void {

			var params = (<any>link).paramValues;

			link.get(params).then(x => {
				this.active = x;
				delete (<any>link).paramValues;
			});
		}
    }
} 