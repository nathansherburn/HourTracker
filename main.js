'use strict';

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const Tray = electron.Tray

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null
let appIcon = null

global.appData = {}

function createWindow () {

  var atomScreen = require('screen');
  var screen = atomScreen.getPrimaryDisplay().workAreaSize;
  var appWidth = 220;
  
  if (mainWindow === null) {  

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: appWidth,
      height: 400,
      frame: false,
      resizable: false,
      x: screen.width - appWidth,
      y: 0
    })

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    appIcon.setContextMenu(Menu.buildFromTemplate([
      { label: 'Close', click: app.quit }
    ]))

    mainWindow.on('closed', function() {
      appIcon.setContextMenu(makeContextMenu(appData.playing))
      mainWindow = null
    })
  }
}

var makeContextMenu = function (playing) {
  return Menu.buildFromTemplate([
    { label: playing ? 'Pause' : 'Play', click: appData.playPause },
    { label: 'Open', click: createWindow },
    { label: 'Close', click: app.quit }
  ])
}

app.on('ready', function () {

  var updateDisplayTime
  var time = 0

  appIcon = new Tray('icon.png')
  
  appData.cumulativeTime = 0
  appData.startTime = 0
  appData.playing = false
  appData.displayTime = '00:00:00'

  appData.makeDisplayTime = function (num) {
    var ss = Math.floor(num) % 60
    var mm = Math.floor(num / 60) % 60
    var hh = Math.floor(num / 60 / 60) % 60
    ss = ss / 10 < 1? "0"+ss : ""+ss
    mm = mm / 10 < 1? "0"+mm : ""+mm
    hh = hh / 10 < 1? "0"+hh : ""+hh
    return hh+":"+mm+":"+ss
  }

  appData.playPause = function () {
    if (appData.playing) {

      appData.playing = false
      appData.cumulativeTime = time
      clearInterval(updateDisplayTime)

      appIcon.setContextMenu(makeContextMenu(false))

      return false

    } else {

      appData.playing = true
      appData.startTime = Date.now()              
      
      updateDisplayTime = setInterval(function() {
        var currentTime = Date.now()
        var startTime = appData.startTime
        time = (currentTime - startTime) / 1000 + appData.cumulativeTime
        appData.displayTime = appData.makeDisplayTime(time)
      }, 100)

      appIcon.setContextMenu(makeContextMenu(true))
      
      return true

    }
  }

  appData.reset = function () {
    clearInterval(updateDisplayTime)
    appData.playing = false
    appData.cumulativeTime = 0
    time = 0
    appData.displayTime = '00:00:00'
  }

  appIcon.setContextMenu(Menu.buildFromTemplate([
    { label: 'Close', click: app.quit }
  ]))

  appIcon.setToolTip('hourTracker')

  appIcon.on('click', createWindow)

  createWindow()
})

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
