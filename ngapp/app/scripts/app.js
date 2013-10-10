'use strict';

var app = angular.module('ngappApp', ['ui.bootstrap', 'ngResource'])
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
  apiRoot: "http://localhost:3000/api/v1/"
})
