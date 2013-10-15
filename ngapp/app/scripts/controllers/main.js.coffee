app = angular.module('ngappApp')
app.controller 'MainCtrl', ["$http", "$scope", ($http, $scope) ->
  $scope.title = ""
  $scope.content = ""
  $http({method: "GET", url: "notes/_design/notes/_view/all?descending=true"}).success (data, status) ->
    $scope.notes = data.rows

  $scope.mouseEnterNote = (index) ->
    $scope.mouseOnNote = index

  $scope.mouseLeaveNote = ->
    $scope.mouseOnNote = undefined

  $scope.mouseIsOnNote = (index) ->
    $scope.mouseOnNote == index

  $scope.editNote = (index) ->
    $scope.editing = index
    $scope.noteEditing = $scope.notes[index]

  $scope.create = ->
    if $scope.content
      newNote = {title: $scope.title, content: $scope.content, created_at: moment().format(), updated_at: moment().format()}
      $http({method: "POST", url: "notes", data: newNote}).success (data, status) ->
        newNote.rev = data.rev
        noteObj = {id: data.id, key: newNote.created_at, value: newNote}
        $scope.notes.unshift(noteObj)
        $scope.title = ""
        $scope.content = ""

  $scope.delete = (index) ->
    $http({method: "DELETE", url: "notes/" + $scope.notes[index].id + "?rev=" + $scope.notes[index].value.rev}).success (data, status) ->
      $scope.notes.splice(index, 1)

  $scope.update = (index) ->
    $scope.noteEditing.value.updated_at = moment().format()
    $http({method: "PUT", url: "notes/" + $scope.noteEditing.id + "?rev=" + $scope.noteEditing.value.rev, data: $scope.noteEditing.value}).success (data, status) ->
      $scope.noteEditing.value.rev = data.rev
      $scope.editing = undefined
      $scope.noteEditing = undefined
]

