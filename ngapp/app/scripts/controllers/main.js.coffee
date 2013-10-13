app = angular.module('ngappApp')
app.factory "Note", ["Configs", "$resource", (Configs, $resource) ->
  $resource(Configs.apiRoot + "notes/:noteId")
]
app.controller 'MainCtrl', ["Note", "$scope", (Note, $scope) ->
  $scope.editing = -1
  $scope.mouseOn = -1
  $scope.title = ""
  $scope.content = ""
  $scope.notes = Note.query()
  $scope.create = ->
    if $scope.content
      Note.save {title: $scope.title, content: $scope.content}, (note) ->
        $scope.notes.unshift(note)
        $scope.title = ""
        $scope.content = ""
  $scope.delete = (index) ->
    Note.delete(noteId: $scope.notes[index].id, ->
      $scope.notes.splice(index, 1)
    )
  $scope.update = (index) ->
    $scope.note.$save(->
      $scope.editing = -1
    )

  $scope.editNote = (index) ->
    $scope.editing = index
    $scope.note = $scope.notes[index]
    console.log($scope.note)
]

