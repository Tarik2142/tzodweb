
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

function roomObj(roomId, socketId, owner, map, password, ownerSocket) {
  this.roomId = roomId;
  this.socketId = socketId;
  this.owner = owner;
  this.map = map;
  this.password = password;
  this.chanelId = this.owner + '_room_' + this.roomId + '_' + Math.round(200 * Math.random());//максимум рандома
  this.players = [owner];
  this.connections = [ownerSocket];
  this.removePlayer = function(socket){
    const playerId = this.connections.indexOf(socket);
    this.connections.splice(playerId, 1);
    this.players.splice(playerId, 1);
  }
  logObj('new room created!', this);
}

var roomList = [];

io.sockets.on('connection', function (socket) {
  var roomId;
  var updateTmr;
  var isServer = false;
  var player;
  
  function toServer(event, data){
    if (roomList[roomId].socketId){
      
     io.to(roomList[roomId].socketId).emit(event, data);//переслать на серв 
    }else{
      log('not connected to server room');
    }
  }
  
  function toClients(event, data){
    io.to(roomList[roomId].chanelId).emit(event, data);
  }
  
  socket.on('disconnect', function (data) {
    roomList[roomId].removePlayer(socket);//убрать дибіла
    if (isServer){
      roomList.splice(roomId, 1);//убрать ковнату
      logObj('roomList splice', roomList);
      toClients('event', 'GG');//сервер вийшов в окошко
    }else{
      if (!roomList[roomId].socketId) return;
      toClients('event', {
        event: 'playerDisconnect',
        player: player
      });//переслать на серв
    }
  });
  
  socket.on('newRoom', function (data) {
    isServer = true;
    roomId = roomList.length;
    roomList.push(new roomObj(roomId, data.socketId, data.owner, data.map, data.password, socket));
    logObj('roomList:', roomList);
		socket.join(roomList[roomId].chanelId);//socket.to(anotherSocketId).emit("private message", socket.id, msg);
    
    // updateTmr = setInterval(function(){
    //   socket.emit('update');
    // }, 1000);
    
	});
  
  socket.on('control', function (data) {
        //log('control recieved');
    toServer('control', data);
	});
  
  socket.on('join', function (data) {//клієнт
    player = data.name;
    const joinTo = data.room;//
    var joined = false;
    log('Join to ' + joinTo);
    roomList.forEach(function(room){//перебрать всі ковнати
      if (room.chanelId == joinTo){//якшо така есть
        joined = true;
        roomId = room.roomId;
        log('Joined to ' + joinTo + '!');
        socket.join(data.room);//зайти
        toServer('event', {//оповістить
          event: 'newPlayer',
          playerName: player
        });
        socket.emit('joinResult', {result: true});//оповістить клієнта
      }
    });
    
    if (!joined){
      socket.emit('joinResult', {result: false, text: 'Room not found!'});//лох
    }
		
	});
});