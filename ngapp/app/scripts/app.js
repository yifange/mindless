'use strict';

var app = angular.module('ngappApp', ['ui.bootstrap', 'restangular', 'ngRoute', 'ngAnimate', 'btford.markdown', 'monospaced.elastic', 'angularMoment'])
app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
app.config(function(RestangularProvider) {
  RestangularProvider.setBaseUrl("/api/v1");
});
app.constant("Configs", {
  apiRoot: "/api/v1/"
});

