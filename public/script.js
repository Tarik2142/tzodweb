function startClient() {
  closeForm();
  startGame();
}

function startServer() {
  delete startPlayers;
  server = true;
  map = $("#mapSelector").val();
  socket.emit("newRoom", {
    playerId: playerName + id,//болше не іспользується
    socketId: socket.id,
    owner: playerName,
    map: map,
    password: $("#password").val()
  });
  closeForm();
  startGame();
}

function startGame() {
  clientList = new clients();
  game = new Phaser.Game(config);
  socket.on("control", function(data) {
    if (data.from == clientList.ownerId) return; //пакет от самого себе
    logObj("control: ", data);
    if (data.data.event) {
      switch (data.data.event) {
        case "playersUpdate":
          if (!server){
           var counter = 0;
            data.data.data.forEach(function(player){
              clientList.clientArr[counter].setPosition(player.x, player.y);
              clientList.clientArr[counter].setRotation(player.rotation);
              //clientList.clientArr[counter].gun.setRotation(player.gunRotation);
              counter++
            }); 
          }
          break;
        case "newPlayer":
          if (data.playerName != playerName)
            clientList.add(
              new tank(
                scene,
                data.data.pos.x,
                data.data.pos.y,
                "tank",
                shapes.blue,
                guns.heavy,
                data.data.playerName
              )
            );
          break;
        case "control":
          if (server){
            if (data.data.data.lmb) {
              log("FIRE");
              clientList.getClient(data.from).fire();
            }
            if (data.data.data.s) {
              log("S press");
              clientList.getClient(data.from).thrustBack(0.03);
            }
            if (data.data.data.w) {
              clientList.getClient(data.from).thrust(0.03);
            }
            if (data.data.data.a) {
              clientList
                .getClient(data.from)
                .setRotation(clientList.getClient(data.from).rotation - 0.1);
            }
            if (data.data.data.d) {
              clientList
                .getClient(data.from)
                .setRotation(clientList.getClient(data.from).rotation + 0.1);
            }
          }else{
            
          }
          break;
        case "gun.rotation":
          if (server){
            clientList.getClient(data.from).gun.rotation = data.data.val;
          }else{
            
          }
          break;
        case "playerDisconnect":
          clientList.remove(data.playerName);
          break;
      }
    }
  });
}

function clients(owner) {
  this.ownerId = 0;
  this.clientArr = new Array();
  this.add = function(player) {
    this.clientArr.push(player);
  };
  this.remove = function(player) {
    var counter = 0;
    //var that = this;
    this.clientArr.forEach(function(client) {
      //logObj('client:', client.id;
      if (client.id == player) {
        client.kill();
        return;
      }
      counter++;
    });
    this.clientArr.splice(counter, 1);
  };
  this.getClient = function(id) {
    return this.clientArr[id];
  };
  this.setOwner = function(id) {
    this.ownerId = id;
  };
  this.getOwner = function() {
    return this.clientArr[this.ownerId];
  };
}

function sendControl(data) {
  socket.emit("control", data);
}

function logObj(text, obj) {
  log(text);
  log(obj);
  log("----------");
}

function log(text) {
  console.log(text);
}

const FPS = 30;
var playerName;
var map;
var config = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  audio: {
    disableWebAudio: true
  },
  fps: {
    target: FPS
  },
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 0, x: 0 },
      debug: true
    }
  },
  parent: "tanks",
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

//---------GLOBAL VARS------------
var startPlayers;
var playerId = 0;
var server = false;
var id = Math.round(100 * Math.random());
var posx = Math.round(500 * Math.random());
var posy = Math.round(500 * Math.random());
var clientList;
var timerId = {};
var socket = io();
var game;
var scene;
//this.input.mouse.disableContextMenu()
var shapes;
var controlold = {
  w: false,
  a: false,
  s: false,
  d: false,
  lmb: false,
  rmb: false
};
var control = {
  w: false,
  a: false,
  s: false,
  d: false,
  lmb: false,
  rmb: false
};

//---------GLOBAL VARS------------

socket.on("GG", function() {
  log("GG");
});

function preload() {
  scene = game.scene.keys.default;
  this.load.image(
    "sky",
    "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fback01.png?v=1610821108096"
  ); //?v=1610478780855
  this.load.image(
    "ground",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Fplatform.png"
  ); //?v=1610478781254
  //this.load.image('star', 'assets/star.png');
  this.load.image(
    "heavy_gun_bullet",
    "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fprojectile_cannon.png?"
  );
  //this.load.atlas("tank", "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fblue.png", "blue.json");
  this.load.image(
    "tank",
    "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fblue.png"
  );
  this.load.json("shapes", "blue.json");
  this.load.image(
    "heavy_gun",
    "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fweap_cannon.png?"
  );
  this.load.image(
    "crate2",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Fbooster.png"
  );
  //this.load.image("tiles", "https://www.mikewesthad.com/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", map);
  this.load.image(
    "tiles",
    "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fwalls.png"
  );
}

function destroyTile(tile) {
  var layer = tile.tilemapLayer;
  layer.removeTileAt(tile.x, tile.y);
  tile.physics.matterBody.destroy();
}

function create() {
  this.matter.world.drawDebug = true;
  this.matter.world.debugGraphic.visible = true;
  this.matter.world.disableGravity();
  this.matter.world.setBounds();
  //this.add.image(400, 300, "sky");
  // scoreText = this.add.text(16, 16, "score: 0", {
  //   fontSize: "32px",
  //   fill: "#000"
  // });

  //obstacle = this.matter.add.sprite( 64, 64,"tank2", null, {shape: shapes.blue});//*/
  /*const map = this.make.tilemap({ data: level, tileWidth: 32, tileHeight: 32 });
  const tiles = map.addTilesetImage("tiles");
  const layer = map.createStaticLayer(0, tiles, 0, 0);*/

  map = this.make.tilemap({ key: "map" });
  tileset = map.addTilesetImage("test", "tiles");
  tileset1 = map.addTilesetImage("back", "sky");

  back = map.createDynamicLayer("back", tileset1, 0, 0);
  belowLayer = map.createDynamicLayer("slot 1", tileset, 0, 0);
  belowLayer.setCollisionByProperty({ collides: true });
  /*const debugGraphics = this.add.graphics().setAlpha(0);
  belowLayer.renderDebug(debugGraphics, {});*/
  //ilemapLayer = this.matter.world.convertTilemapLayer(belowLayer);
  this.matter.world.convertTilemapLayer(belowLayer);

  //obstacle = this.matter.add.sprite( 64, 64,"tank", null, {shape: shapes.blue});//
  //this.matter.world.convertTiles(tileset);
  //console.log(this);
  //;

  //log('socket id = ' + socket.id);

  //clients[id] = new tank(this, posx, posy,"tank",shapes.blue, guns.heavy, playerName);//scene, x, y, texture, startGun, shape
  // socket.emit("tankCreate", {
  //   id: id,
  //   posx: posx,
  //   posy: posy
  // });

  this.matter.world.on(
    "collisionstart",
    function(event) {
      tzodCollision.update(event);
    },
    this
  );

  shapes = this.cache.json.get("shapes");
  if(server){
    clientList.add(new tank(scene, posx, posy, "tank", shapes.blue, guns.heavy, playerName));//server
  }else{
    //clientList = new clients(new tank(scene, posx, posy, "tank", shapes.blue, guns.heavy, startPlayers[0]));
    var counter = 0;
    startPlayers.forEach(function(player) {
      if(playerName == player){//якшо це ми
        clientList.setOwner(counter);
      }
     clientList.add(new tank(scene, posx, posy, "tank", shapes.blue, guns.heavy, player));
      counter++;
    });
  logObj("clientList", clientList);
    startPlayers = undefined;
    delete startPlayers;
  }
  
}

// function handleMove() {
//   socket.emit("tankMove", {
//     x: clients[id].x,
//     y: clients[id].y,
//     angle: clients[id].rotation,
//     gunangle: clients[id].gun.rotation,
//     id: id
//   });
// }

function update(time, delta) {
  //handleMove();
  //var cursors = scene.input.keyboard.createCursorKeys();
  var cursors = this.input.keyboard.addKeys("W,S,A,D");
  var pointer = scene.input.activePointer;
  /*const worldPoint = this.input.activePointer.positionToCamera(
    this.cameras.main
  );*/
  //this.matter.world.convertTilemapLayer(belowLayer);

    /*if (pointer.isDown) {
      control.lmb = pointer.isDown;
      // clients[id].fire();
      // socket.emit("fire", {
      // id: id,
      // });
      //clients[id].setNick(['я твой дом кирпич шатал', 'и бетон тоже']);
    } else {
      control.lmb = false;
    }//*/
    var poz =
      clientList.getOwner().gun.rotation -
      Math.atan2(
        pointer.y - clientList.getOwner().gun.y,
        pointer.x - clientList.getOwner().gun.x
      );
    if ((poz > 0.05 && poz < 3.14) || poz < -3.15) {
      //console.log("-");
      clientList.getOwner().gun.rotation =
        clientList.getOwner().gun.rotation - 0.05;
      sendControl({
        event: "gun.rotation",
        val: clientList.getOwner().gun.rotation
      }); //*/
    } else if ((poz < -0.05 && poz > -3.14) || poz > 3.15) {
      clientList.getOwner().gun.rotation =
        clientList.getOwner().gun.rotation + 0.05;
      sendControl({
        event: "gun.rotation",
        val: clientList.getOwner().gun.rotation
      }); //*/
      //console.log("+");
    } else {
      //console.log("0");
    }

    /*
    if (cursors.S.isDown) {
      control.s = cursors.S.isDown;
      sendControl({
        event: "control",
        data: {
          key: "S",
          val: cursors.S.isDown
        }
      });
      //socket.emit('downisDown',{'id': id});
      //clients[id].thrustBack(0.03);
    } else {
      control.s = false;
    }
    if (cursors.W.isDown) {
      control.w = cursors.W.isDown;
      //socket.emit('upisDown',{'id': id});
      //clients[id].thrust(0.03);
    } else {
      control.w = false;
    }
    if (cursors.A.isDown) {
      control.a = cursors.A.isDown;
      //socket.emit('leftisDown',{'id': id});
      //clients[id].setRotation(clients[id].rotation - 0.1);
    } else {
      control.a = false;
    }
    if (cursors.D.isDown) {
      control.d = cursors.D.isDown;
      //socket.emit('rightisDown',{'id': id});
      //clients[id].setRotation(clients[id].rotation + 0.1);
    } else {
      control.d = false;
    }
    //*/

    control.lmb = pointer.isDown;
    control.s = cursors.S.isDown;
    control.w = cursors.W.isDown;
    control.a = cursors.A.isDown;
    control.d = cursors.D.isDown;
    if (JSON.stringify(control) !== JSON.stringify(controlold)) {
      controlold = Object.assign({}, control);
      sendControl({
        event: "control",
        data: control
      });
    }
  
  if(server){
    if (pointer.isDown) {
      log("POINTER");
      clientList.getOwner().fire();
    }
    if (cursors.S.isDown) {
      clientList.getOwner().thrustBack(0.03);
    }
    if (cursors.W.isDown) {
      clientList.getOwner().thrust(0.03);
    }
    if (cursors.A.isDown) {
      clientList.getOwner().setRotation(clientList.getOwner().rotation - 0.1);
    }
    if (cursors.D.isDown) {
      clientList.getOwner().setRotation(clientList.getOwner().rotation + 0.1);
    }
    
    function playerPos(x, y, rotation, gunRotation){
      this.x = x;
      this.y = y;
      this.rotation = rotation;
      this.gunRotation = gunRotation;
    }
    var positionsArr = [];
    clientList.clientArr.forEach(function(client){
      positionsArr.push(new playerPos(client.x, client.y, client.rotation, client.gun.rotation));
    });
    sendControl({
        event: "playersUpdate",
        data: positionsArr
      });
  }
  
}
