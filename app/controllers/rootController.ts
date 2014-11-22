/// <reference path="../root/basecontroller.ts" />

module controllers {
    export class RootController extends Root.BaseController {

        //static $inject: string[] = ['$scope', '$state']

        // @ngInject
		constructor($scope, $state: ng.ui.IStateService, $q : ng.IQService){
			super($scope);
			this.message = "Drinking the BIG Gulp, automagically!!";
			this.other = $state.current.name; //"2nd line in the paragraph and beyond";
			
			this.value = 1;
			this.$q = $q;

			this.promise = this.original();
		}

		private $q : ng.IQService;

		public message: string;
		public other: string;

		public promise: ng.IPromise<number>;
		public value: number;
		
		public original() {
			var defer = this.$q.defer();
			console.log('original executed');
			this.value = 0;
			defer.resolve(0);
			return defer.promise;
		}

		public checkPromise() {

			//this.promise = (<any>this.$q).when(this.promise, x => {
			//	this.value++;
			//});

			this.promise.then(x => {
				this.value++;
			});
		}
	}
}