app = angular.module('ngappApp')
app.controller 'MainCtrl', ["Restangular", "$scope", (Restangular, $scope) ->
  notes = Restangular.all("notes")
  $scope.title = ""
  $scope.content = ""
  notes.getList().then((notes) ->
    $scope.notes = notes
  )
  $scope.mouseEnterNote = (index) ->
    $scope.mouseOnNote = index

  $scope.mouseLeaveNote = ->
    $scope.mouseOnNote = undefined

  $scope.mouseIsOnNote = (index) ->
    $scope.mouseOnNote == index

  $scope.create = ->
    if $scope.content
      newNote = {title: $scope.title, content: $scope.content}
      notes.post(newNote).then (note)->
        $scope.notes.unshift(note)
        $scope.title = ""
        $scope.content = ""

  $scope.delete = (index) ->
    $scope.notes[index].remove().then ->
      $scope.notes.splice(index, 1)

  $scope.update = (index) ->
    $scope.note.put().then ->
      $scope.editing = undefined

  $scope.editNote = (index) ->
    $scope.editing = index
    $scope.note = $scope.notes[index]
]

