
function startClient() {
  closeForm();
  startGame();
  log("playerName");
  log(playerName);

  socket.on("control", function(data) {
    if (data.event) {
      logObj("event: ", data);
      switch (data.event) {
        case "newPlayer":
          if (data.playerName != playerName)
            clientList.add(
              new tank(
                scene,
                data.pos.x,
                data.pos.y,
                "tank",
                shapes.blue,
                guns.heavy,
                data.playerName
              )
            );
          break;
        case "control":
            logObj("control->data", data.data);
          break;
        case "playerDisconnect":
          clientList.remove(data.playerName);
          break;
      }
    }
  });
  setInterval(function() {
    
    //socket.emit('control', control);
  }, 1000);
}

function startGame() {
  game = new Phaser.Game(config);
}

function clients(owner) {
  this.clientArr = new Array();
  this.clientArr[0] = owner;
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
  this.getOwner = function() {
    return this.clientArr[0];
  };
}

function sendControl(data) {
  socket.emit("control", data);
}

function startServer() {
  map = $("#mapSelector").val();
  serverMode = true;

  socket.emit("newRoom", {
    playerId: playerName + id,
    socketId: socket.id,
    owner: playerName,
    map: map,
    password: $("#password").val()
  });

  closeForm();
  startGame();

  //clientList = new clients(new tank(scene, posx, posy, "tank", shapes.blue, guns.heavy, playerName));

  socket.on("event", function(data) {
    if (data.event) {
      logObj("event: ", data);
      switch (data.event) {
        case "newPlayer":
          if (data.playerName != playerName) {
            clientList.add(
              new tank(
                scene,
                posx,
                posy,
                "tank",
                shapes.blue,
                guns.heavy,
                data.playerName
              )
            );
            sendControl({
              event: "newPlayer",
              playerName: data.playerName,
              pos: {
                x: posx,
                y: posy
              }
            });
          }

          break;

        case "playerDisconnect":
          clientList.remove(data.playerName);
          break;
      }
    }
  });

  //-----network
  socket.on("control", function(data) {
    logObj("control received", data);
  });
  //------------
}

const FPS = 30;
var serverMode = false;
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

function logObj(text, obj) {
  log(text);
  log(obj);
  log("----------");
}

function log(text) {
  console.log(text);
}

var id = Math.round(100 * Math.random());
var posx = Math.round(500 * Math.random());
var posy = Math.round(500 * Math.random());
// A flag for drawing activity
var clientList;
var timerId = {};
var socket = io();
//var tilemapplus=tilemap-plus();

var game;
var scene;
//this.input.mouse.disableContextMenu()
var shapes;
var control = {
  w: false,
  a: false,
  s: false,
  d: false,
  lmb: false,
  rmb: false
};

// socket.on("downisDown", function(data) {
//   if (data.id != id && clients[data.id]) {
//     clients[data.id].thrustBack(0.05);
//   }
// });
// socket.on("leftisDown", function(data) {
//   if (data.id != id && clients[data.id]) {
//     clients[data.id].setRotation(clients[data.id].rotation - 0.1);
//   }
// });
// socket.on("rightisDown", function(data) {
//   if (data.id != id && clients[data.id]) {
//     clients[data.id].setRotation(clients[data.id].rotation + 0.1);
//   }
// });
// socket.on("upisDown", function(data) {
//   if (data.id != id && clients[data.id]) {
//     clients[data.id].thrust(0.05);
//   }
// });
// socket.on("tankMove", function(data) {
//   // Is the user drawing?
//   if (data.id != id && clients[data.id]) {
//     clients[data.id].x = data.x;
//     clients[data.id].y = data.y;
//     clients[data.id].rotation = data.angle;
//     clients[data.id].gun.rotation = data.gunangle;
//     clearTimeout(timerId[data.id]);
//     timerId[data.id] = setTimeout(function() {
//       clients[data.id].kill();
//       //clients.splice(data.id, 1); //почистить масив
//     }, 20000);
//   }
// });
// socket.on("fire", function(data) {
//   if (data.id != id && clients[data.id]) {
//     clients[data.id].fire();
//   }
// });
// socket.on("tankCreate", function(data) {
//   if (data.id != id && !clients[data.id]) {
//     //createTank(scene, data.id, data.posx, data.posy,shapes.blue);
//     clients[data.id] = new tank(scene, data.posx, data.posy,"tank",shapes.blue, guns.heavy, id);//scene, x, y, texture, startGun, shape
//     socket.emit("tankCreate", {
//       id: id,
//       posx: posx,
//       posy: posy
//     });
//   }
// });

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
  clientList = new clients(
    new tank(scene, posx, posy, "tank", shapes.blue, guns.heavy, playerName)
  );
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

document.body.addEventListener("keydown", function(e) {
  sendControl({
        event: "control",
        data: {
          key: e.keyCode,
          val: true
        }
});
  
document.body.addEventListener("keyup", function(e) {
  ksendControl({
        event: "control",
        data: {
          key: e.keyCode,
          val: false
        }
});

function update(time, delta) {
  //handleMove();
  //var cursors = scene.input.keyboard.createCursorKeys();
  var cursors = this.input.keyboard.addKeys("W,S,A,D");
  var pointer = scene.input.activePointer;
  /*const worldPoint = this.input.activePointer.positionToCamera(
    this.cameras.main
  );*/
  //this.matter.world.convertTilemapLayer(belowLayer);
  if (!serverMode) {
    if (pointer.isDown) {
      control.lmb = true;
      // clients[id].fire();
      // socket.emit("fire", {
      // id: id,
      // });
      //clients[id].setNick(['я твой дом кирпич шатал', 'и бетон тоже']);
    } else {
      control.lmb = false;
    }
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
    } else if ((poz < -0.05 && poz > -3.14) || poz > 3.15) {
      clientList.getOwner().gun.rotation =
        clientList.getOwner().gun.rotation + 0.05;
      //console.log("+");
    } else {
      //console.log("0");
    }

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
      control.w = true;
      //socket.emit('upisDown',{'id': id});
      //clients[id].thrust(0.03);
    } else {
      control.w = false;
    }
    if (cursors.A.isDown) {
      control.a = true;
      //socket.emit('leftisDown',{'id': id});
      //clients[id].setRotation(clients[id].rotation - 0.1);
    } else {
      control.a = false;
    }
    if (cursors.D.isDown) {
      control.d = true;
      //socket.emit('rightisDown',{'id': id});
      //clients[id].setRotation(clients[id].rotation + 0.1);
    } else {
      control.d = false;
    }
  } else {
    if (pointer.isDown) {
      clientList.getOwner().fire();
    }
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
    } else if ((poz < -0.05 && poz > -3.14) || poz > 3.15) {
      clientList.getOwner().gun.rotation =
        clientList.getOwner().gun.rotation + 0.05;
      //console.log("+");
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
  }
}
