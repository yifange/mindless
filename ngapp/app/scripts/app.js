'use strict';

var app = angular.module('ngappApp', ['ui.bootstrap', 'ngResource', 'ngRoute', 'ngAnimate'])
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
app.value("Configs", {
  apiRoot: "/api/v1/"
})
