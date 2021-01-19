const FPS = 30;
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

var game = new Phaser.Game(config);
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
    "crate",
    "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fprojectile_cannon.png?"
  );
  //this.load.atlas("tank", "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fblue.png", "blue.json");
  this.load.image("tank", "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fblue.png");
  this.load.json('shapes', 'blue.json');
  /*this.load.image(
    "tank",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Ftank1.png"
  );*/
  this.load.image(
    "gun",
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
  this.load.atlas("tank2", "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Fblue.png", "atlas.json");
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
  clients[id] = new tank(this, posx, posy,"tank",shapes.blue, guns.heavy, id);//scene, x, y, texture, startGun, shape
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
      //log(event);
//       for (var i = 0; i < event.pairs.length; i++) {
//         var bodyA = event.pairs[i].bodyA;
//         var bodyB = event.pairs[i].bodyB;
//         var damagg=11;
//         //log(event.pairs[i].bodyA.label);
//         if (event.pairs[i].bodyA.label=="heavyBullet"){damagg=101;}
//         /*if(bodyA.gameObject){
//           if(bodyA.gameObject.name){
//           log('BODY A' + bodyA.gameObject.name);
            
//           }
//         }else if(bodyB.gameObject){
//           if(bodyB.gameObject.name){
//             log('BODY B' + bodyB.gameObject.name);
//           }
//         }*/
//         var tileBody = bodyA.label === "collides" ? bodyA : bodyB;
//         //log("a=");
//         //log(bodyA.velocity);
//         //log(bodyA.label);
//         //gameObject.name
//         //log(bodyA);
//         //log("b=");
//         //log(bodyB.velocity);
//         //log(bodyB.label);
//         //log(bodyB);
//         if (tileBody.gameObject) {
//           var tileWrapper = tileBody.gameObject;
//           if (tileWrapper.tile) {
//             var tile = tileWrapper.tile;
//             if (tile.properties.hp!=0) {
//               //if 
//               for(var damag=damagg;damag>0;){
//                 var hp= tile.properties.hp
//                 //log("hp "+hp);
//                 //log("dam "+damag);
//                 if (tile.properties.hp>0){
//                   tile.properties.hp=tile.properties.hp-damag;
//                   damag=damag-hp
//                 }//else if (tile.properties.hp==0){damag=-1;}
//                 else if (tile.properties.hp<=0){
//                   if (tile.properties.nextlauer<1){
//                     destroyTile(tile);
//                     damag=-1;
//                   }else{
//                     //destroyTile(tile);
//                     //log("x "+tile.x+"y "+tile.y);
//                     belowLayer.putTileAtWorldXY(tile.properties.nextlauer, tile.x*32, tile.y*32).setCollision(true);
//                     tile.properties.hp=belowLayer.gidMap[1].tileProperties[tile.properties.nextlauer-1].hp;
//                     tile.properties.nextlauer=belowLayer.gidMap[1].tileProperties[tile.properties.nextlauer-1].nextlauer;
//                   }
//                 }
//               //log("last "+tile.properties.hp);
//                 //log("last "+tile.properties.nextlauer);
//               }
              
              
//             }
//           }
//         }

//         //             if ((bodyA === playerBody && bodyB.label === 'disappearingPlatform') ||
//         //                 (bodyB === playerBody && bodyA.label === 'disappearingPlatform'))
//         //             {
//         //                 var tileBody = bodyA.label === 'disappearingPlatform' ? bodyA : bodyB;

//         //                 // Matter Body instances have a reference to their associated game object. Here,
//         //                 // that's the Phaser.Physics.Matter.TileBody, which has a reference to the
//         //                 // Phaser.GameObjects.Tile.
//         //                 var tileWrapper = tileBody.gameObject;
//         //                 var tile = tileWrapper.tile;

//         //                 // Only destroy a tile once
//         //                 if (tile.properties.isBeingDestroyed)
//         //                 {
//         //                     continue;
//         //                 }
//         //                 tile.properties.isBeingDestroyed = true;

//         //                 // Since we are using ES5 here, the local tile variable isn't scoped to this block -
//         //                 // bind to the rescue.
//         //                 this.tweens.add({
//         //                     targets: tile,
//         //                     alpha: { value: 0, duration: 500, ease: 'Power1' },
//         //                     onComplete: destroyTile.bind(this, tile)
//         //                 });
//       }

      // Note: the tile bodies in this level are all simple rectangle bodies, so checking the
      // label is easy. See matter detect collision with tile for how to handle when the tile
      // bodies are compound shapes or concave polygons.
    },
    this
  );
  
  scene.input.keyboard.on('keydown-W', function(){
    clients[id].thrust(0.03);
  });
  
  scene.input.keyboard.on('keydown-A', function(){
    clients[id].setRotation(clients[id].rotation - 0.1);
  });
  
  scene.input.keyboard.on('keydown-S', function(){
    clients[id].thrustBack(0.03);
  });
  
  scene.input.keyboard.on('keydown-D', function(){
    clients[id].setRotation(clients[id].rotation + 0.1);
  });
  
  /*this.input.keyboard.on('keydown', function(params){
    if (params.key=='s') {
    //socket.emit('downisDown',{'id': id});
    clients[id].thrustBack(0.03);
  } else if (params.key=='w') {
    //socket.emit('upisDown',{'id': id});
    clients[id].thrust(0.03);
  }
  if (params.key=='a') {
    //socket.emit('leftisDown',{'id': id});
    clients[id].setRotation(clients[id].rotation - 0.1);
  } else if (params.key=='d') {
    //socket.emit('rightisDown',{'id': id});
    clients[id].setRotation(clients[id].rotation + 0.1);
  }
  });*/
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
  handleMove();
  //var cursors = scene.input.keyboard.createCursorKeys();
  var cursors = this.input.keyboard.addKeys('W,S,A,D');
  var pointer = scene.input.activePointer;
  /*const worldPoint = this.input.activePointer.positionToCamera(
    this.cameras.main
  );*/
  this.matter.world.convertTilemapLayer(belowLayer);
  // Draw tiles (only within the groundLayer)
  /*if (pointer.isDown) {
    //belowLayer.getTileAtWorldXY(worldPoint.x, worldPoint.y).setCollision(false, false, false, false, true);
    //belowLayer.putTileAtWorldXY(1, worldPoint.x, worldPoint.y).setCollision(false);
    //belowLayer.putTileAtWorldXY(17, worldPoint.x, worldPoint.y).setCollision(false);
    //belowLayer.setCollisionByProperty({ collides: false });
    //const debugGraphics = this.add.graphics().setAlpha(0);
    //belowLayer.renderDebug(debugGraphics, {});
    //log(Phaser.Physics.Matter.TileBody.destroy());
    //this.Physics.Matter.TileBody.destroy()
    //this.matter.world.convertTilemapLayer(belowLayer);
    /*belowLayer.gidMap[1].tileProperties[16].hp=5
    log(belowLayer.gidMap[1].tileProperties[16].hp);
    log(belowLayer);*/
  //}
  if (pointer.isDown) {
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

  /*if (){
    
  }else if (gun.rotation>Math.atan2(pointer.y - gun.y, pointer.x - gun.x))
    {
      
    }*/
  //gun.rotation=Math.atan2(pointer.y - gun.y, pointer.x - gun.x)
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

/*function createTank(game, id, x, y) {
  log(id);
  if (!(id in clients)) {
    
    // тут создать танк игрока 2
    //clients[id] = game.add.sprite(64, 64, "tank");
    /*gun[id] = game.add.image(0, 0, "gun");
game.matter.add.gameObject(clients[id]).setScale(0.8,0.8);
game.matter.add.gameObject(gun[id]);

  cat1 = game.matter.world.nextCategory();
  cat2 = game.matter.world.nextCategory();
  cat3 = game.matter.world.nextCategory();

  //player.setRotation(45);
  clients[id].setFrictionAir(0.5);
  clients[id].setPosition(x, y);
  gun[id].depth = 1;
  clients[id].setMass(5);
  clients[id].setCollisionCategory(cat1);
  gun[id].setCollisionCategory(cat2);
  gun[id].setCollidesWith(cat2);
  game.matter.add.constraint(clients[id], gun[id], 0, 0);*/
  //}*/
//}
