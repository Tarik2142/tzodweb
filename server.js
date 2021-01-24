
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
  this.chanelId = this.owner + '_room_' + this.roomId + '_' + Math.round(200 * Math.random());//максимум рандома
  logObj('new room created!', this);
}

var roomList = [];
var connections = [];

io.sockets.on('connection', function (socket) {
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
    if (isServer()){
      roomList.splice(roomId, 1);//убрать ковнату
      logObj('roomList splice', roomList);
      socket.emit('GG');//сервер вийшов в окошко
    }
  });
  
  socket.on('newRoom', function (data) {
    roomId = roomList.length;
    roomList.push(new roomObj(roomId, data.socketId, data.owner, data.map, data.password));
    logObj('roomList:', roomList);
		socket.join(roomList[roomId].chanelId);//socket.to(anotherSocketId).emit("private message", socket.id, msg);
    
    socket.on('control', function (data) {//roomId, playerNickname, password
		logObj(data);
	});
    
	});
  
  socket.on('join', function (data) {//roomId, playerNickname, password
    const joinTo = data.room;//
    var joined = false;
    log('Join to ' + joinTo);
    roomList.forEach(function(room){//
      if (room.chanelId == joinTo){
        joined = true;
        log('Joined to ' + joinTo + '!');
        socket.join(data.room);
        io.sockets.in(data.room).emit('update', {
          command: 'newPlayer',
          playerName: data.name
        });
      }
    });
    
    if (!joined){
      socket.emit('')
    }
		
	});
});