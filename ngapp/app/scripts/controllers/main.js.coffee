app = angular.module('ngappApp')
app.factory "Note", (Configs, $resource) ->
  $resource(Configs.apiRoot + "notes/:noteId")
app.controller 'MainCtrl', (Note, $scope) ->
  $scope.notes = Note.query()

