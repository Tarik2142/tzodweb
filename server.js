// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT);
var io = require('socket.io')(server);
require('@geckos.io/phaser-on-nodejs')
const Phaser = require('phaser')
const jQuery = require('jQuery');
//const io = require('socket.io');
// set the fps you need
const FPS = 30
global.phaserOnNodeFPS = FPS // default is 60
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
  }
  create() {
    console.log('it works!')
  }
}
/*const config = {
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
}*/
const config = {
  type: Phaser.HEADLESS,
  width: 1280,
  height: 720,
  banner: false,
  audio: false,
  scene: [MainScene],
  fps: {
    target: FPS
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }
    }
  }
}
new Phaser.Game(config)
function log(text){
  console.log(text);
}


/*class game {
  static initialize() {
    console.log('initializing server game');
    (() => new Phaser.Game(config))()
  }
}

game.initialize()*/

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
	/*socket.on('tankMove', function (data) {
		// This line sends the event (broadcasts it)
		// to everyone except the originating client. upisDown
		socket.broadcast.emit('tankMove', data);
	});*/
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
    log(data);
	});
});