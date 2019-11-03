const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const bcrypt = require("bcryptjs")

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const savesFile = new FileSync('json/saves.json')
const saves = low(savesFile)

const md5 = require("md5")

let win

saves.defaults({ historic: [], most_used: [] }).write()


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

	win.loadFile(path.join(__dirname, './templates/layout.html'))
	win.on("ready-to-show", () => { win.show() })
	win.on('closed', () => {
		win = null
	})
})

ipcMain.on("hash-md5", (event, args) => {
	event.reply("hash-md5-reply", md5(args))
})




app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})