'use strict';

var app = angular.module('ngappApp', ['ui.bootstrap', 'ngResource', 'ngRoute', 'ngAnimate', 'btford.markdown', 'monospaced.elastic'])
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
app.constant("Configs", {
  apiRoot: "/api/v1/"
});

