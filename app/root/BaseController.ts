module Root {
	export class BaseController {

        // @ngInject
		constructor($scope : ng.IScope){
			this.$scope = $scope;
		}

		public $scope : ng.IScope;
	}
}

// @ngInject
function OtherController($scope, $state) {
	$scope.again = 'd';
	$scope.x = $state.name;
}