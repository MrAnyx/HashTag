const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const bcrypt = require("bcryptjs")
const sha256 = require('js-sha256');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const savesFile = new FileSync('json/saves.json')
const saves = low(savesFile)

const _ = require("underscore")

const md5 = require("md5")

let win

saves.defaults({ historic: [], most_used: [{id: "MD5", count: 0}, {id: "Bcrypt", count: 0}, {id: "SHA-256", count: 0}] }).write()


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

	//win.setMenu(null)
	win.loadFile(path.join(__dirname, './templates/layout.html'))
	win.on("ready-to-show", () => { win.show() })
	win.on('closed', () => {
		win = null
	})
})

ipcMain.on("hash-md5", (event, args) => {
	let count = saves.get('most_used').find({id: "MD5"}).value().count
	saves.get("most_used").find({id: "MD5"}).assign({ count: count + 1}).write()
	saves.get("historic").push({uuid: new Date().getTime(), type: "MD5", text: args, hash: md5(args)}).write()
	event.reply("hash-md5-reply", md5(args))
})

ipcMain.on("hash-bcrypt", (event, args) => {
	let hash = bcrypt.hashSync(args.text, args.salt)
	let count = saves.get('most_used').find({id: "Bcrypt"}).value().count
	saves.get("most_used").find({id: "Bcrypt"}).assign({ count: count + 1}).write()
	saves.get("historic").push({uuid: new Date().getTime(), type: "Bcrypt", text: args.text, hash: hash, salt: args.salt}).write()
	event.reply("hash-bcrypt-reply", hash)
})

ipcMain.on("hash-sha", (event, args) => {
	let hash = sha256(args)
	let count = saves.get('most_used').find({id: "SHA-256"}).value().count
	saves.get("most_used").find({id: "SHA-256"}).assign({ count: count + 1}).write()
	saves.get("historic").push({uuid: new Date().getTime(), type: "SHA-256", text: args, hash: hash}).write()
	event.reply("hash-sha-reply", hash)
})

ipcMain.on("get-historic", (evt, args) => {
	let result = {
		historic: _.first(_.sortBy(saves.get("historic").value(), "uuid").reverse(), 10),
		most_used: saves.get("most_used").value()
	}
	evt.reply("get-historic-reply", result)
})



app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})