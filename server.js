
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
    log('player removed! ID=' + playerId + ' | name=' + this.players[playerId]);
    this.players.splice(playerId, 1);
  }
  this.addPlayer = function(socket, player){
    this.connections.push(socket);
    const id = this.players.push(player);
    logObj('add player ' + player + ' | ID=' + id , this);
    return id;
  }
  this.getPlayerId = function(socket){
    return this.connections.indexOf(socket);
  }
  logObj('new room created!', this);
}

var roomList = [];

io.sockets.on('connection', function (socket) {
  var roomId;
  var updateTmr;
  var isServer = false;
  var player;
  var playerId;
  
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
    if (!roomList[roomId]) return; //ковнати боль ше нет
    roomList[roomId].removePlayer(socket);//убрать дибіла
    if (isServer){
      toClients('event', {
        event: 'serverClose'
      });//сервер вийшов в окошко
      roomList.splice(roomId, 1);//убрать ковнату
      logObj('roomList splice', roomList);
    }else{
      if (!roomList[roomId].socketId) return;
      toClients('event', {
        event: 'playerDisconnect',
        playerName: player
      });//переслать на серв
    }
  });
  
  socket.on('newRoom', function (data) {
    isServer = true;
    roomId = roomList.length;
    roomList.push(new roomObj(roomId, data.socketId, data.owner, data.map, data.password, socket));
    logObj('roomList:', roomList);
		socket.join(roomList[roomId].chanelId);//socket.to(anotherSocketId).emit("private message", socket.id, msg);
    socket.emit('event', {//ід обратно на серв
      event: 'room_created',
      roomId: roomList[roomId].chanelId
    });
    // updateTmr = setInterval(function(){
    //   socket.emit('update');
    // }, 1000);
    
	});
  
  socket.on('control', function (data) {
    const from = roomList[roomList.getPlayerId(socket)];//ник от кого
        //log('control recieved');
    toServer('control', {from: from, data: data});
	});
  
  socket.on('join', function (data) {//клієнт
    player = data.name;
    const joinTo = data.room;//
    var joined = false;
    log('Join to ' + joinTo);
    roomList.forEach(function(room){//перебрать всі ковнати
      if (room.chanelId == joinTo){//якшо така есть
        if (room.password){//
          if (!data.password){//
            socket.emit('joinResult', {result: false, text: 'Enter room password!'});//оповістить клієнта
            log('Empty password!');
            return;
          }else{
            if (!data.password == room.password){
              socket.emit('joinResult', {result: false, text: 'Wrong room password!'});//оповістить клієнта
              log('Wrong password!');
              return;
            }
          }
        }
        joined = true;
        roomId = room.roomId;
        playerId = roomList[roomId].addPlayer(socket, player);
        log('Joined to ' + joinTo + '!');
        socket.join(data.room);//зайти
        toClients('event', {//оповістить
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