// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT);
var io = require('socket.io')(server);
const Phaser = require('@geckos.io/phaser-on-nodejs');
const jQuery = require('jQuery');
//const io = require('socket.io');
const config = {
  type: Phaser.HEADLESS,//Phaser.AUTO,
  width: 1024,
  height: 640,
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 0, x: 0 },
      debug: true
    }
  },
  // disable audio
  audio: {
    noAudio: true
  },
  scene: {
    preload: () => { console.log('server preload') },
    create: () => { console.log('server create') },
    update: () => { console.log('server update') }
  },
  title: 'Phaser server app',
  backgroundColor: '#06C6F8',
  transparent: true,
  disableContextMenu: true
}
function log(text){
  console.log(text);
}


class game {
  static initialize() {
    console.log('initializing server game');
    (() => new Phaser.Game(config))()
  }
}

game.initialize()

// our default array of dreams

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});


// listen for requests :)
/*const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});*/

io.sockets.on('connection', function (socket) {
	// Start listening for mouse move events
	socket.on('tankMove', function (data) {
		// This line sends the event (broadcasts it)
		// to everyone except the originating client. upisDown
		socket.broadcast.emit('tankMove', data);
	});
  socket.on('upisDown', function (data) {
		socket.broadcast.emit('upisDown', data);
	});
    socket.on('downisDown', function (data) {
		socket.broadcast.emit('downisDown', data);
	});
    socket.on('leftisDown', function (data) {
		socket.broadcast.emit('leftisDown', data);
	});
    socket.on('rightisDown', function (data) {
		socket.broadcast.emit('rightisDown', data);
	});
  socket.on('tankCreate', function (data) {
		socket.broadcast.emit('tankCreate', data);
	});
});