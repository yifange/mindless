app = angular.module('ngappApp')
app.controller 'MainCtrl', ($resource, $scope) ->
  Note = $resource("http://localhost:3000/api/v1/notes/:noteId")
  $scope.notes = [
    {
      title: "hello",
      content: "he"
    }
  ]
