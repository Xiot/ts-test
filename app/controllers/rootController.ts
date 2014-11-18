/// <reference path="../root/basecontroller.ts" />

module controllers {
    export class RootController extends Root.BaseController {

        //static $inject: string[] = ['$scope', '$state']

        
		constructor($scope, $state: ng.ui.IState){
			super($scope);
			$scope.message = "Drinking the BIG Gulp, automagically!!";
			$scope.other = $state.name; //"2nd line in the paragraph and beyond";
		}
	}
}