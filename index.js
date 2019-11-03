const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const bcrypt = require("bcryptjs")
const sha256 = require('js-sha256');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const savesFile = new FileSync('json/saves.json')
const saves = low(savesFile)

const md5 = require("md5")

let win

saves.defaults({ historic: [], most_used: [{id: "md5", count: 0}, {id: "bcrypt", count: 0}, {id: "sha256", count: 0}] }).write()


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
	let count = saves.get('most_used').find({id: "md5"}).value().count
	saves.get("most_used").find({id: "md5"}).assign({ count: count + 1}).write()
	saves.get("historic").push({uuid: new Date().getTime(), type: "MD5", text: args, hash: md5(args)}).write()
	event.reply("hash-md5-reply", md5(args))
})

ipcMain.on("hash-bcrypt", (event, args) => {
	let count = saves.get('most_used').find({id: "bcrypt"}).value().count
	saves.get("most_used").find({id: "bcrypt"}).assign({ count: count + 1}).write()
	saves.get("historic").push({uuid: new Date().getTime(), type: "Bcrypt", text: args.text, hash: bcrypt.hashSync(args.text, args.salt), salt: args.salt}).write()
	event.reply("hash-bcrypt-reply", bcrypt.hashSync(args.text, args.salt))
})

ipcMain.on("hash-sha", (event, args) => {
	let count = saves.get('most_used').find({id: "sha256"}).value().count
	saves.get("most_used").find({id: "sha256"}).assign({ count: count + 1}).write()
	saves.get("historic").push({uuid: new Date().getTime(), type: "SHA-256", text: args, hash: sha256(args)}).write()
	event.reply("hash-sha-reply", sha256(args))
})




app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})