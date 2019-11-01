const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const bcrypt = require("bcryptjs")


let win


app.on('ready', () => {

	win = new BrowserWindow({
		width: 600,
		height: 400,
		resizable: false,
		center: true,
		icon: path.join(__dirname, './src/icon.png'),
		webPreferences: { nodeIntegration: true },
		show: false
	})

	win.loadFile('templates/layout.html')

	win.on("ready-to-show", () => { win.show() })

	win.on('closed', () => {
		win = null
	})

})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})