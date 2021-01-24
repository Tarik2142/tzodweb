
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT);
var io = require('socket.io')(server);

function log(text){
  console.log(text);
}

function logObj(text, obj){
  log(text);
  log(obj);
  log('----------');
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
  this.chanelId = this.owner + '_room_' + this.roomId;
  logObj('new room created!', this);
}

var roomList = [];
var connections = [];

io.sockets.on('connection', function (socket) {
  var isServer = false;
  var roomId;
  
  function isServer(){
    if (roomId){
      return true;
    }else{
      return false;
    }
  }
  
  connections.push(socket);
  
  socket.on('disconnect', function (data) {
    connections.splice(connections.indexOf(socket), 1);//убрать подключение
    roomList.splice(roomId, 1);//убрать ковнату
    logObj('roomList splice', roomList);
      socket.broadcast.emit('GG');
  });
  
  socket.on('newRoom', function (data) {
    isServer = true;
    roomId = roomList.length;
    roomList.push(new roomObj(roomId, data.socketId, data.owner, data.map, data.password));
    logObj('roomList:', roomList);
		socket.join(roomList[roomId].chanelId);//socket.to(anotherSocketId).emit("private message", socket.id, msg);
    socket.on('disconnect', () => {
    
  });
    
    socket.on('control', function (data) {//roomId, playerNickname, password
		logObj(data);
	});
    
	});
  
  socket.on('join', function (data) {//roomId, playerNickname, password
    log('join');
    logObj(data.name);
		socket.join(data.room);
     io.sockets.in(data.room).emit('update', {
      command: 'newPlayer',
      playerName: data.name
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