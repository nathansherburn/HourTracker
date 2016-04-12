var remote = require('remote')
var Nedb = require('nedb')

var db = new Nedb({filename: './data.db', autoload: true })

var app = angular.module('hourtracker', [])

app.controller('MainController', function($scope, $interval, $location, $anchorScroll, $document) {

  var appData = remote.getGlobal('appData')

  $scope.displayTime = appData.displayTime
  $scope.playing = appData.playing
  $scope.log = []

  refreshLog()

  $interval(() => $scope.displayTime = appData.displayTime, 100)

  function refreshLog () {
    db.find({}, function (err, logs) {
      $scope.log = logs
      $scope.$apply()
      $location.hash('bottom')
      $anchorScroll()
    })
  }

  $scope.playPause = function () {
    $scope.playing = appData.playPause()
  }

  $scope.reset = function () {
    appData.reset()
    $scope.playing = false
  }

  $scope.addToList = function () {
    var d = moment().format('ddd, MMM Do, h:mm a')
    db.insert({
        dateString: d,
        hours: appData.displayTime,
        deleted: false,
        date: Date.now()
      },
      () => {
        refreshLog()
        $scope.reset()
      }
    )
  }

  $scope.updateValues = function (e) {
    db.update(
      { _id: e._id },
      { $set: { hours: e.hours, dateString: e.dateString } },
      { multi: false }
    )
  }
  
  $scope.delete = function (e) {
    db.update(
      { _id: e._id },
      { $set: { deleted: true } },
      { multi: false },
      () => refreshLog()
    )
  }

  $scope.close = function () {
    var window = remote.getCurrentWindow()
    window.close()
  }

})