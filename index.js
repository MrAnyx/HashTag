const { app, BrowserWindow } = require('electron')
const path = require('path')

let win

function createWindow () {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    resizable: false,
    center: true,
    icon: path.join(__dirname, './src/icon.png'),
    webPreferences: { nodeIntegration: true }
  })

  win.loadFile('index.html')


  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})