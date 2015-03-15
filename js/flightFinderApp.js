'use strict';

var myApp = angular.module('flightFinderApp', ['ngRoute', 'ui.bootstrap', 'ngMap']);

    myApp.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'SearchCtrl'});
    }]);