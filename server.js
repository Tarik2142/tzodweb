var express = require("express");
var app = express();
var server = app.listen(process.env.PORT);
var io = require("socket.io")(server);

function log(text) {
  console.log(text);
}

function logObj(text, obj) {
  log(text);
  log(obj);
  log("----------");
}

app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

function roomObj(roomId, socketId, owner, map, password, ownerSocket) {
  this.roomId = roomId;
  this.socketId = socketId;
  this.owner = owner;
  this.map = map;
  this.password = password;
  this.chanelId =
    this.owner + "_room_" + this.roomId + "_" + Math.round(200 * Math.random()); //максимум рандома
  this.players = [owner];
  this.connections = [ownerSocket];
  this.removePlayer = function(socket) {
    const playerId = this.connections.indexOf(socket);
    this.connections.splice(playerId, 1);
    log("player removed! ID=" + playerId + " | name=" + this.players[playerId]);
    this.players.splice(playerId, 1);
  };
  this.addPlayer = function(socket, player) {
    this.connections.push(socket);
    const id = this.players.push(player);
    logObj("add player " + player + " | ID=" + id, this);
    return id;
  };
  this.getPlayerId = function(socket) {
    return this.connections.indexOf(socket);
  };
  logObj("new room created!", this);
}

var roomList = [];

io.sockets.on("connection", function(socket) {
  var roomId;
  var updateTmr;
  var isServer = false;
  var player;
  var playerId;
  
  var network = {
    brodcast: function(name, data){
      io.to(roomList[roomId].chanelId).emit(name, data);
    },
    toServer: function(name, data){
      if (roomList[roomId].socketId) {
      io.to(roomList[roomId].socketId).emit(name, data); //переслать на серв
    } else {
      log("not connected to server room");
    }
    },
    toClient(clientId, name, data){
      io.to(roomList[roomId].connections[clientId]).emit(name, data);
    }
  }

  socket.on("disconnect", function(data) {
    if (!roomList[roomId]) return; //ковнати больше нет
    roomList[roomId].removePlayer(socket); //убрать дибіла
    if (isServer) {
      network.brodcast("control", {data: {
        event: "serverClose"
      }}); //сервер вийшов в окошко
      roomList.splice(roomId, 1); //убрать ковнату
      logObj("roomList splice", roomList);
    } else {
      if (!roomList[roomId].socketId) return; //якшо такий есть
      network.brodcast("control", {data: {
        event: "playerDisconnect",
        playerName: player
      }}); //переслать на серв
    }
  });

  socket.on("newRoom", function(data) {
    isServer = true;
    roomId = roomList.length;
    roomList.push(
      new roomObj(
        roomId,
        data.socketId,
        data.owner,
        data.map,
        data.password,
        socket
      )
    );
    logObj("roomList:", roomList);
    socket.join(roomList[roomId].chanelId); //socket.to(anotherSocketId).emit("private message", socket.id, msg);
    socket.emit("event", {
      //ід обратно на серв
      event: "room_created",
      roomId: roomList[roomId].chanelId
    });
  });

  socket.on("control", function(data) {
    //console.log("control");
    if (!roomList[roomId]) return;
      //if (!roomList[roomId].getPlayerId(socket)) return; //якшо нет ковнати
      const from = roomList[roomId].getPlayerId(socket); //ник от кого
      //console.log("from" + from);
      if (isServer){//от сервера
        //console.log("brodcast");
        network.brodcast("control", {from: from, data});
      }else{
       network.toServer("control", {from: from, data }); 
      }
  });

  socket.on("listRooms", function() {
    //список ковнат
    //log('List rooms->');
    function responseRoomObj(name, players, map, password) {
      this.name = name;
      this.players = players;
      this.map = map;
      this.password = password;
    }

    let responseRoomlist = [];
    let counter = 0;

    roomList.forEach(function(room) {
      //перебор
      responseRoomlist.push(
        new responseRoomObj(room.chanelId, room.players, room.map, room.password ? true : false)
      ); //добавить поддержку кастомних имен ковнат!!!!!
      counter++;
      if (counter >= roomList.length) {
        socket.emit("roomList", responseRoomlist); //отправить список
      }
    });
  });

  socket.on("join", function(data) {
    //клієнт
    player = data.name;
    const joinTo = data.room; //
    let joined = false;
    //var data = data;
    let room;
    log("Join to " + joinTo);
    roomList.forEach(function(room) {
      //перебрать всі ковнати
      if (room.chanelId == joinTo) {
        //якшо така есть
        room = room;
        log(
                "data.password: " +
                  data.password +
                  "room.password: " +
                  room.password
              );
        if (checkroompas(data,room)) {
              roomId = room.roomId; //індекс найденой ковнати
              playerId = roomList[roomId].addPlayer(socket, player);
              log("Joined to " + joinTo + "!");
              socket.join(data.room); //зайти
              network.brodcast("control", {data: {
                //оповістить
                event: "newPlayer",
                playerName: player,
                  pos: {
                    x: 100,
                    y: 100
                }
              }
              });
              socket.emit("joinResult", {
                result: true,
                map: roomList[roomId].map,
                players: roomList[roomId].players
              }); //оповістить клієнта
            }
      }
    });
  });
  
  function checkroompas(data,room) {
    if (!data.password) {
            //
      if (!room.password) {return true}
            socket.emit("joinResult", {
              result: false,
              text: "Enter room password!"
            }); //оповістить клієнта
            log("Empty password!");
          } 
    else if (parseInt(data.password) != parseInt(room.password)) {//!!Пароль може бути не тільки із цифр
              socket.emit("joinResult", {
                result: false,
                text: "Wrong password!"
              }); //оповістить клієнта
              log("Wrong password!");
            }
    else{return true}
  }
});
