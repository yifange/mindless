app = angular.module('ngappApp')
app.factory "Note", ["Configs", "$resource", (Configs, $resource) ->
  $resource(Configs.apiRoot + "notes/:noteId")
]
app.controller 'MainCtrl', ["Note", "$scope", (Note, $scope) ->
  $scope.notes = Note.query()
  $scope.create = ->
    if $scope.content
      Note.save {title: $scope.title, content: $scope.content}, (note) ->
        $scope.notes.push(note)
        $scope.title = ""
        $scope.content = ""
  $scope.delete = (index) ->
    Note.delete(noteId: $scope.notes[index].id, ->
      $scope.notes.splice(index, 1)
    )
]

