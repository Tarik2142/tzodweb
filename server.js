// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT);
var io = require('socket.io')(server);
require('@geckos.io/phaser-on-nodejs');
const Phaser = require('phaser');
const jQuery = require('jQuery');
//const io = require('socket.io');
const config = {
  type: Phaser.HEADLESS,//Phaser.AUTO,
  width: 1024,
  height: 640,
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 0, x: 0 },
      debug: true
    }
  },
  // disable audio
  audio: {
    noAudio: true
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  title: 'Phaser server app',
  backgroundColor: '#06C6F8',
  transparent: true,
  disableContextMenu: true
}
function log(text){
  console.log(text);
}
class gun extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this);
  }
}
class tank extends Phaser.Physics.Matter.Sprite {
  gun;
  speed;
  armor;
  constructor(scene, x, y, texture, frame, walls) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this);
  }
  update() {}
}
var id = Math.round(jQuery.now()*Math.random());
var drawing = false;
var clients = {};
//var game = new Phaser.Game(config);
var scene;
//this.input.mouse.disableContextMenu()
var currentSpeed = 0;
var movebackSpeed = 0;
var lastFired = 0;
var canFire = true;
var scoreText;
//var player,gun1,tank2;

function preload() {
  log("preload");
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
}
function create() {
  this.matter.world.drawDebug = true;
  this.matter.world.debugGraphic.visible = true;
  this.matter.world.disableGravity();
  this.matter.world.setBounds();
  this.add.image(400, 300, "sky");
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  gun = this.add.image(0, 0, "gun");

  //console.log(this);

  player = this.add.sprite(64, 64, "tank");

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

  this.matter.add.gameObject(player);
  this.matter.add.gameObject(gun);

  cat1 = this.matter.world.nextCategory();
  cat2 = this.matter.world.nextCategory();
  cat3 = this.matter.world.nextCategory();

  //player.setRotation(45);
  player.setFrictionAir(0.5);
  player.setPosition(500, 500);
  gun.depth = 1;
  player.setMass(5);
  player.setCollisionCategory(cat1);
  gun.setCollisionCategory(cat2);
  gun.setCollidesWith(cat2);
  this.matter.add.constraint(player, gun, 0, 0);
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
  	if($.now() - lastEmit > 5){
  socket.emit('tankMove',{
				'x': player.x,
				'y': player.y,
        'angle' : player.rotation,
				//'drawing': drawing,
				'id': id
			});
    }
}

function update(time, delta) {
  var cursors = scene.input.keyboard.createCursorKeys();
  var pointer = scene.input.activePointer;
  if (cursors.left.isDown) {
    player.setRotation(player.rotation - 0.1);
  } else if (cursors.right.isDown) {
    player.setRotation(player.rotation + 0.1);
  }

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
  var mat=Math.atan2(pointer.y - gun.y, pointer.x - gun.x);
  //scoreText.setText('Score: ' + mat);
  var poz=gun.rotation-mat;
  //scoreText.setText(poz+'Score: ' + mat);
      if (poz>0.05&&poz<3.14||poz<-3.15){
        //console.log("-");
        gun.rotation=gun.rotation-0.05;
      }else if (poz<-0.05&&poz>-3.14||poz>3.15){
      gun.rotation=gun.rotation+0.05;
        //console.log("+");
      }
  
  /*if (){
    
  }else if (gun.rotation>Math.atan2(pointer.y - gun.y, pointer.x - gun.x))
    {
      
    }*/
  //gun.rotation=Math.atan2(pointer.y - gun.y, pointer.x - gun.x)
  if (cursors.down.isDown) {
    player.thrustBack(0.05);
    scoreText.x=pointer.x;
    scoreText.y=pointer.y;
  }
  if (cursors.up.isDown) {
    //player.thrust(0.05);
  }
}



class game {
  static initialize() {
    console.log('initializing server game');
    (() => new Phaser.Game(config))()
  }
}

game.initialize()

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// listen for requests :)
/*const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});*/

io.sockets.on('connection', function (socket) {
	// Start listening for mouse move events
	/*socket.on('tankMove', function (data) {
		// This line sends the event (broadcasts it)
		// to everyone except the originating client. upisDown
		socket.broadcast.emit('tankMove', data);
	});*/
  socket.on('upisDown', function (data) {
		// This line sends the event (broadcasts it)
		// to everyone except the originating client. upisDown
		socket.broadcast.emit('upisDown', data);
    //player.thrust(0.05);
	});
  socket.on('tankCreate', function (data) {
		socket.broadcast.emit('tankCreate', data);
	});
});