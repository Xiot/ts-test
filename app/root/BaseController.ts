module Root {
	export class BaseController {

		constructor($scope : ng.IScope){
			this.$scope = $scope;
		}

		public $scope : ng.IScope;
	}
}