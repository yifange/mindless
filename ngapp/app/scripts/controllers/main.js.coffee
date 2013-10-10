app = angular.module('ngappApp')
app.controller 'MainCtrl', ($scope) ->
  $scope.notes = [
    {
      title: "hello",
      content: "he"
    }
  ]
