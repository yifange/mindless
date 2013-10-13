'use strict';
var app = angular.module('ngappApp', [
    'ui.bootstrap',
    'restangular',
    'ngRoute',
    'ngAnimate',
    'btford.markdown',
    'monospaced.elastic',
    'angularMoment'
  ]);
app.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).otherwise({ redirectTo: '/' });
  }
]);
app.config([
  'RestangularProvider',
  function (RestangularProvider) {
    RestangularProvider.setBaseUrl('/api/v1');
  }
]);
app.constant('Configs', { apiRoot: '/api/v1/' });
(function () {
  var app;
  app = angular.module('ngappApp');
  app.controller('MainCtrl', [
    'Restangular',
    '$scope',
    function (Restangular, $scope) {
      var notes;
      notes = Restangular.all('notes');
      $scope.title = '';
      $scope.content = '';
      notes.getList().then(function (notes) {
        return $scope.notes = notes;
      });
      $scope.mouseEnterNote = function (index) {
        return $scope.mouseOnNote = index;
      };
      $scope.mouseLeaveNote = function () {
        return $scope.mouseOnNote = void 0;
      };
      $scope.mouseIsOnNote = function (index) {
        return $scope.mouseOnNote === index;
      };
      $scope.create = function () {
        var newNote;
        if ($scope.content) {
          newNote = {
            title: $scope.title,
            content: $scope.content
          };
          return notes.post(newNote).then(function (note) {
            $scope.notes.unshift(note);
            $scope.title = '';
            return $scope.content = '';
          });
        }
      };
      $scope['delete'] = function (index) {
        return $scope.notes[index].remove().then(function () {
          return $scope.notes.splice(index, 1);
        });
      };
      $scope.update = function (index) {
        return $scope.note.put().then(function () {
          return $scope.editing = void 0;
        });
      };
      return $scope.editNote = function (index) {
        $scope.editing = index;
        return $scope.note = $scope.notes[index];
      };
    }
  ]);
}.call(this));