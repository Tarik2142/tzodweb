
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT);
var io = require('socket.io')(server);

function log(text){
  console.log(text);
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
}

var roomList = [];

io.sockets.on('connection', function (socket) {
  
  socket.on('newRoom', function (data) {
    const roomId = roomList.length;
    roomList.push(new roomObj(, data.socketId, data.owner, data.map, data.password));
		socket.join(data.owner + data.socketId);//socket.to(anotherSocketId).emit("private message", socket.id, msg);
    socket.on('disconnect', () => {
    // socket.rooms.size === 0
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