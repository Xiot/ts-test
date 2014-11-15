module controllers {
	export class RootController extends Root.BaseController {
		constructor($scope){
			super($scope);
			$scope.message = "Hello World";
		}
	}
}