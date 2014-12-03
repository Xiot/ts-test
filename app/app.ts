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
    .controller('otherController', OtherController);

angular.module('ts-test').config(function($httpProvider : ng.IHttpProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = 'Basic eGlvdDp4ZWEsMjEsODdy';
});

angular.module('ts-test')
    .config(function($stateProvider) {
    $stateProvider.state('root', {
            url: '',
            controller: 'rootController',
            controllerAs: 'vm',
            templateUrl: 'app/partials/root.html'
        })
        .state('explorer', {
            url: '/explore',
            controller: Controllers.ExplorerController,
            controllerAs: 'vm',
            templateUrl: 'app/partials/explorer.html',
            resolve: {
                root: function ($http: ng.IHttpService) {

                    var parserFactory = new Services.ResourceParserFactory();
                    parserFactory.parsers.push(new Services.Parsers.GitHubParser());

                    var opt = {
                        url: 'https://api.github.com',
                        parser: parserFactory, //new Services.Parsers.GitHubParser(),
                        http: $http
                    };
                    return new Services.Resource(opt).activate();
                }
            }
});
    });
