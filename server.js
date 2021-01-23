
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT);
var io = require('socket.io')(server);
const divider = '----------';

function log(text){
  console.log(text);
}

function logObj(text, obj){
  log(text);
  log(obj);
  log(divider);
}

app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});


// listen for requests :)
/*const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});*/

function roomObj(roomId, socketId, owner, map, password) {
  this.roomId = roomId;
  this.socketId = socketId;
  this.owner = owner;
  this.map = map;
  this.password = password;
  logObj('new room created!', this);
}

var roomList = [];

io.sockets.on('connection', function (socket) {
  
  socket.on('newRoom', function (data) {
    const roomId = roomList.length;
    roomList.push(new roomObj(roomId, data.socketId, data.owner, data.map, data.password));
    logObj('roomList:', roomList);
		socket.join(data.owner + roomId);//socket.to(anotherSocketId).emit("private message", socket.id, msg);
    socket.on('disconnect', () => {
    roomList.splice(roomId, 1);
    logObj('roomList splice', roomList);
      socket.broadcast.emit('GG');
  });
    
    var updateTmr = setTimeout(function (){
      socket.broadcast.emit('update');
    }, 50);
    
    socket.on('join', function (data) {//roomId, playerNickname, password
		socket.broadcast.emit('update', {
      command: 'newPlayer'
    });
	});
    
    socket.on('join', function (data) {//roomId, playerNickname, password
		socket.broadcast.emit('update', {
      command: 'newPlayer'
    });
	});
    
	});
  
	// // Start listening for mouse move events
	// socket.on('tankMove', function (data) {
	// 	// This line sends the event (broadcasts it)
	// 	// to everyone except the originating client. upisDown
	// 	socket.broadcast.emit('tankMove', data);
	// });
	// socket.on('upisDown', function (data) {
	// 	socket.broadcast.emit('upisDown', data);
	// });
	// socket.on('downisDown', function (data) {
	// 	socket.broadcast.emit('downisDown', data);
	// });
	// socket.on('leftisDown', function (data) {
	// 	socket.broadcast.emit('leftisDown', data);
	// });
	// socket.on('rightisDown', function (data) {
	// 	socket.broadcast.emit('rightisDown', data);
	// });
	// socket.on('fire', function (data) {
	// 	socket.broadcast.emit('fire', data);
	// });
	// socket.on('tankCreate', function (data) {
	// 	socket.broadcast.emit('tankCreate', data);
	// log(data);
	// });
});