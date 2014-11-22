//module Loader {
//    export class AppLoader {

//        public app: any;

//        constructor(parameters) {


//            this.app = angular.module('ts-test', ['ui.router']);
//            this.app.controller('rootController', controllers.RootController);
//            this.app.config(function ($stateProvider) {
//                $stateProvider.state('root', {
//                    url: '',
//                    controller: 'rootController'
//                })
//                    })
//                }

//    }
//}

angular.module('ts-test', ["ui.router"])
    .controller('rootController', controllers.RootController)
    // @ngInject
    //.controller('inlineController', function ($scope) {
    //    $scope.inline = true;
    //})

;

angular.module('ts-test')
    .controller('otherController', OtherController)

angular.module('ts-test')
    
    .config(function($stateProvider) {
        $stateProvider.state('root', {
            url: '',
			controller: 'rootController',
			controllerAs: 'vm',
            templateUrl: 'app/partials/root.html'
        })
    })
