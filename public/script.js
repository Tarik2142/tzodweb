function startGame(){
  game = new Phaser.Game(config);
}

var playerPrototype = {
  id: '0',
  nick: 'player',
  gun: 0
}

class room {
  owner;
  roomname;
  password;
  players;
  map;
  
  constructor(owner, roomname, password, map){
    this.owner = owner;
    this.roomname = roomname;
    this.password = password;
    this.map = map;
    this.players = [owner];
  }
  
  join(player){
    this.players.push(player);
  }
  
}

function startServer(){
  socket.emit("newRoom", {
    socketId: socket.id, 
    owner: playerName, 
    map: $('#mapSelector').val(), 
    password: $('#password').val()
  });
  closeForm();
  startGame();
}

const FPS = 30;
var playerName;
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

function log(text) {
  console.log(text);
}

var id = Math.round(100 * Math.random());
var posx = Math.round(500 * Math.random());
var posy = Math.round(500 * Math.random());
// A flag for drawing activity
var clients = {};
var timerId = {};
var socket = io();
//var tilemapplus=tilemap-plus();

var game;
var scene;
//this.input.mouse.disableContextMenu()
var currentSpeed = 0;
var movebackSpeed = 0;
var lastFired = 0;
var canFire = true;
var scoreText;
var shapes;

socket.on("downisDown", function(data) {
  if (data.id != id && clients[data.id]) {
    clients[data.id].thrustBack(0.05);
  }
});
socket.on("leftisDown", function(data) {
  if (data.id != id && clients[data.id]) {
    clients[data.id].setRotation(clients[data.id].rotation - 0.1);
  }
});
socket.on("rightisDown", function(data) {
  if (data.id != id && clients[data.id]) {
    clients[data.id].setRotation(clients[data.id].rotation + 0.1);
  }
});
socket.on("upisDown", function(data) {
  if (data.id != id && clients[data.id]) {
    clients[data.id].thrust(0.05);
  }
});
socket.on("tankMove", function(data) {
  // Is the user drawing?
  if (data.id != id && clients[data.id]) {
    clients[data.id].x = data.x;
    clients[data.id].y = data.y;
    clients[data.id].rotation = data.angle;
    clients[data.id].gun.rotation = data.gunangle;
    clearTimeout(timerId[data.id]);
    timerId[data.id] = setTimeout(function() {
      clients[data.id].kill();
      //clients.splice(data.id, 1); //почистить масив
    }, 20000);
  }
});
socket.on("fire", function(data) {
  if (data.id != id && clients[data.id]) {
    clients[data.id].fire();
  }
});
socket.on("tankCreate", function(data) {
  if (data.id != id && !clients[data.id]) {
    //createTank(scene, data.id, data.posx, data.posy,shapes.blue);
    clients[data.id] = new tank(scene, data.posx, data.posy,"tank",shapes.blue, guns.heavy, id);//scene, x, y, texture, startGun, shape
    socket.emit("tankCreate", {
      id: id,
      posx: posx,
      posy: posy
    });
  }
});

socket.on("GG", function() {
  log('GG');
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
  this.load.image("tank", "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fblue.png");
  this.load.json('shapes', 'blue.json');
  this.load.image(
    "heavy_gun",
    "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fweap_cannon.png?"
  );
  this.load.image(
    "crate2",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Fbooster.png"
  );
  //this.load.image("tiles", "https://www.mikewesthad.com/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "map1.json");
  this.load.image(
    "tiles",
    "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fwalls.png"
  );
}

function destroyTile (tile)
{
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
  
  shapes = this.cache.json.get('shapes');
  //obstacle = this.matter.add.sprite( 64, 64,"tank", null, {shape: shapes.blue});//
  //this.matter.world.convertTiles(tileset);
  //console.log(this);
  //;
  
  //log('socket id = ' + socket.id);
  
  clients[id] = new tank(this, posx, posy,"tank",shapes.blue, guns.heavy, playerName);//scene, x, y, texture, startGun, shape
  clients[id + 1] = new tank(this, posx, posy,"tank",shapes.blue, guns.heavy, playerName + 'tester');
  socket.emit("tankCreate", {
    id: id,
    posx: posx,
    posy: posy
  });
  
  var is = 2;

  
  this.matter.world.on(
    "collisionstart",
    function(event) {
      tzodCollision.update(event);
    },
    this
  );
  
}

function handleMove() {
  socket.emit("tankMove", {
    x: clients[id].x,
    y: clients[id].y,
    angle: clients[id].rotation,
    gunangle: clients[id].gun.rotation,
    id: id
  });
}

function update(time, delta) {
  //handleMove();
  //var cursors = scene.input.keyboard.createCursorKeys();
  var cursors = this.input.keyboard.addKeys('W,S,A,D');
  var pointer = scene.input.activePointer;
  /*const worldPoint = this.input.activePointer.positionToCamera(
    this.cameras.main
  );*/
  this.matter.world.convertTilemapLayer(belowLayer);

  if (pointer.isDown) {
    clients[id + 1].kill();
    clients[id].fire();
    socket.emit("fire", {
    id: id,
    });
    //clients[id].setNick(['я твой дом кирпич шатал', 'и бетон тоже']);
  }
  var poz =
    clients[id].gun.rotation -
    Math.atan2(pointer.y - clients[id].gun.y, pointer.x - clients[id].gun.x);
  if ((poz > 0.05 && poz < 3.14) || poz < -3.15) {
    //console.log("-");
    clients[id].gun.rotation = clients[id].gun.rotation - 0.05;
  } else if ((poz < -0.05 && poz > -3.14) || poz > 3.15) {
    clients[id].gun.rotation = clients[id].gun.rotation + 0.05;
    //console.log("+");
  }

  if (cursors.S.isDown) {
    //socket.emit('downisDown',{'id': id});
    clients[id].thrustBack(0.03);
  } else if (cursors.W.isDown) {
    //socket.emit('upisDown',{'id': id});
    clients[id].thrust(0.03);
  }
  if (cursors.A.isDown) {
    //socket.emit('leftisDown',{'id': id});
    clients[id].setRotation(clients[id].rotation - 0.1);
  } else if (cursors.D.isDown) {
    //socket.emit('rightisDown',{'id': id});
    clients[id].setRotation(clients[id].rotation + 0.1);
  }
}