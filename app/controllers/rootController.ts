/// <reference path="../root/basecontroller.ts" />
/// <reference path="../../node_modules/typescript-services/typescriptservices.d.ts" />
/// <reference path="../../node_modules/typescript-services/typescriptservices.d.ts" />

module controllers {
    export class RootController extends Root.BaseController {

        //static $inject: string[] = ['$scope']

        // @ngInject
		constructor($scope){
			super($scope);
            $scope.message = "Drinking the big Gulp, automagically.";

            var s = TypeScript.SimpleText.fromString("");
		}
	}
}