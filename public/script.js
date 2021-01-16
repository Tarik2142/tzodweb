
//console.log("hello world :o");
//import Phaser from 'phaser';
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  audio: {
    disableWebAudio: true
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

function log(text){
  console.log(text);
}

/*class gun extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this);
  }
}*/

/*class tank extends Phaser.Physics.Matter.Sprite {
  gun;
  speed;
  armor;
  constructor(scene, x, y, texture, frame, walls) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this);
  }
  update() {}
}*/

var id = Math.round(100*Math.random());
	var posx = Math.round(500*Math.random());
  var posy = Math.round(500*Math.random());
	// A flag for drawing activity
	var drawing = false;
	var clients = {};
  var gun = {};
	var socket = io();

var game = new Phaser.Game(config);
var scene;
//this.input.mouse.disableContextMenu()
var currentSpeed = 0;
var movebackSpeed = 0;
var lastFired = 0;
var canFire = true;
var scoreText;
//var player,gun1,tank2;
socket.on('downisDown', function (data) {
		if(data.id != id && clients[data.id]){
			clients[data.id].thrustBack(0.05);
		}
	});
socket.on('leftisDown', function (data) {
		if(data.id != id && clients[data.id]){
			clients[data.id].setRotation(clients[data.id].rotation - 0.1);
		}
	});
socket.on('rightisDown', function (data) {
		if(data.id != id && clients[data.id]){
			clients[data.id].setRotation(clients[data.id].rotation + 0.1);
		}
	});
socket.on('upisDown', function (data) {
		if(data.id != id && clients[data.id]){
			clients[data.id].thrust(0.05);
		}
	});
socket.on('tankMove', function (data) {
		// Is the user drawing?
		if(data.id != id && clients[data.id]){
			clients[data.id].x = data.x;
      clients[data.id].y = data.y;
      clients[data.id].rotation = data.angle;
      gun[data.id].rotation = data.gunangle;
		}
	});
socket.on('tankCreate', function (data) {
  if(data.id != id && !clients[data.id]){
		createTank(scene,data.id,data.posx,data.posy);
    socket.emit('tankCreate',{
      'id': id,
      'posx':posx,
      'posy':posy
    });}
	});
function preload() {
  scene = game.scene.keys.default;
  this.load.image(
    "sky",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Fsky.png"
  ); //?v=1610478780855
  this.load.image(
    "ground",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Fplatform.png"
  ); //?v=1610478781254
  //this.load.image('star', 'assets/star.png');
  this.load.image(
    "crate",
    "https://cdn.glitch.com/16cdd3f6-e40c-4947-903e-79981081614a%2Fbullet.png"
  );
  this.load.image(
    "tank",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Ftank1.png"
  );
  this.load.image(
    "gun",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Fturret2.png"
  );
  this.load.image(
    "crate2",
    "https://cdn.glitch.com/772bc608-91dd-4577-857d-f1f6ed4d7332%2Fbooster.png"
  );
  this.load.image("tiles", "https://www.mikewesthad.com/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "https://cdn.glitch.com/4fc97b97-fbe3-4d16-be05-c0b4fb6814b8%2Ftuxemon-town.json");
}

function create() {
  this.matter.world.drawDebug = true;
  this.matter.world.debugGraphic.visible = true;
  this.matter.world.disableGravity();
  this.matter.world.setBounds();
  this.add.image(400, 300, "sky");
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  const map = this.make.tilemap({ key: "map" });
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
  const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
  const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

  //console.log(this);
  createTank(this,id,posx,posy);
  socket.emit('tankCreate',{
      'id': id,
      'posx':posx,
      'posy':posy
    });
  
  

  this.matter.add
    .gameObject(this.add.image(600, 400, "ground", 0))
    .setStatic(true)
    .setName("platform");
  this.matter.add
    .gameObject(this.add.image(50, 250, "ground", 0))
    .setStatic(true)
    .setName("platform");
  this.matter.add
    .gameObject(this.add.image(750, 220, "ground", 0))
    .setStatic(true)
    .setName("platform");
}

//-----TEST------
var bullet = [];

function fireBullet(game, player) {
  //addMass(x, y, r, sides, Vx, Vy)
  var i = bullet.length;
  log('bullet mass len = ' + i);
  var angle = player.rotation;
  var speed = 50;
  var playerDist = 25;
  bullet.push();
  bullet[i] = game.matter.bodies.circle(
    player.x + playerDist * Math.cos(angle),
    player.y + playerDist * Math.sin(angle),
    20
  );
  //log(game.matter.add.gameObject(bullet[i]));
  bullet[i].body.rotation = angle;
  bullet[i].setMass(0.01);
  bullet[i].setFriction(0, 0, 0);
  // bullet[i].setOnCollide(function(){
  //   setTimeout(function(){
  //     if (bullet[i]){
  //       bullet[i].destroy();
  //     }
  //   }, 10);
  // });

  bullet[i].setOnCollide(pair => {
    if (pair.bodyA.gameObject !== null){// спс
      if (pair.bodyA.gameObject.name == "platform") {
        //setTimeout(function() {
          if (bullet[i]) {
            bullet[i].setVelocity(0, 0);
            //bullet[i].setVisible(false);
            pair.bodyB.destroy();
          }
        //}, 5);
      }
    }
    

    // pair.bodyA
    // pair.bodyB
  });
  setTimeout(function() {
    if (bullet[i]) {
      //bullet[i].setVisible(false);
      bullet[i].destroy();
    }
  }, 2000);
  // game.matter.setVelocity(bullet[i], {
  //   x: player.body.velocity.x + speed,
  //  y: player.body.velocity.y + speed
  // });

  //game.matter.setAngularVelocity(bullet[i], (Math.random() - 0.5) * 1);
  game.matter.world.add(game.matter.world, bullet[i]);
  
  bullet[i].setVelocity(
    player.body.velocity.x + speed * Math.cos(angle),
    player.body.velocity.y + speed * Math.sin(angle)
  );
  //console.log(bullet);
  //bullet[i].setCollisionCategory(cat3);
  //bullet[i].setCollidesWith(cat3);
}

function bulletEndCycle() {
  for (var i = 0; i < bullet.length; i++) {
    if (bullet[i].endCycle < game.cycle) {
      Matter.World.remove(engine.world, bullet[i]);
      bullet.splice(i, 1);
    }
  }
}

//--------------

var canFire = true;

function fireCd(time) {
  canFire = false;
  setTimeout(function() {
    canFire = true;
  }, time);
}


function handleMove(){
			socket.emit('tankMove',{
				'x': clients[id].x,
				'y': clients[id].y,
        'angle' : clients[id].rotation,
        'gunangle':gun[id].rotation,
				'id': id
			});
}

function update(time, delta) {
  handleMove()
  
  var cursors = scene.input.keyboard.createCursorKeys();
  var pointer = scene.input.activePointer;
  
  if (pointer.isDown) {
    //var bomb = player.create(10, 16, 'tank');
    if (canFire) {
      //
      //console.log(Math.atan2(pointer.y - gun.y, pointer.x - gun.x));
      //gun.rotation=Math.atan2(pointer.y - gun.y, pointer.x - gun.x)
      fireCd(200);
      //fireBullet(this, gun);//player
    }
  }
  var poz=gun[id].rotation-Math.atan2(pointer.y - gun[id].y, pointer.x - gun[id].x);
      if (poz>0.05&&poz<3.14||poz<-3.15){
        //console.log("-");
        gun[id].rotation=gun[id].rotation-0.05;
      }else if (poz<-0.05&&poz>-3.14||poz>3.15){
      gun[id].rotation=gun[id].rotation+0.05;
        //console.log("+");
      }
  
  /*if (){
    
  }else if (gun.rotation>Math.atan2(pointer.y - gun.y, pointer.x - gun.x))
    {
      
    }*/
  //gun.rotation=Math.atan2(pointer.y - gun.y, pointer.x - gun.x)
  if (cursors.down.isDown) {
    //socket.emit('downisDown',{'id': id});
    clients[id].thrustBack(0.05);
  }
  else if (cursors.up.isDown) {
    //socket.emit('upisDown',{'id': id});
    clients[id].thrust(0.05);
  }
  if (cursors.left.isDown) {
    //socket.emit('leftisDown',{'id': id});
    clients[id].setRotation(clients[id].rotation - 0.1);
  } else if (cursors.right.isDown) {
    //socket.emit('rightisDown',{'id': id});
    clients[id].setRotation(clients[id].rotation + 0.1);
  }
}

function createTank (game,id,x,y) {
  log(id);
  if(! (id in clients)){
			// тут создать танк игрока 2
			clients[id] = game.add.sprite(64, 64, "tank");
      gun[id] = game.add.image(0, 0, "gun");
game.matter.add.gameObject(clients[id]);
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
  game.matter.add.constraint(clients[id], gun[id], 0, 0);
		}
}