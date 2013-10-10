app = angular.module('ngappApp')
app.controller 'MainCtrl', ($resource, $scope) ->
  Note = $resource("/api/v1/notes/:noteId")

  $scope.notes = Note.query()

  # $scope.notes = [
  #   {
  #     title: "hello",
  #     content: "he"
  #   }
  # ]
