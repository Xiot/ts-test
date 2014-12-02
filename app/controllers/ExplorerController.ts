module Controllers {
    export class ExplorerController {
        constructor(root: Services.Resource) {

            this.active = root;
        }

        public active: Services.Resource;
    }
} 