
console.log("hello world :o");
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

var id = Math.round(Math.random());
	
	// A flag for drawing activity
	var drawing = false;
	var clients = {};
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
}

function create() {
  this.matter.world.drawDebug = true;
  this.matter.world.debugGraphic.visible = true;
  this.matter.world.disableGravity();
  this.matter.world.setBounds();
  //this.add.image(400, 300, "sky");
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
  socket.emit('tankCreate',{'id': id});
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

var lastEmit = $.now();

function handleMove(){
  
			socket.emit('tankMove',{
				'x': player.x,
				'y': player.y,
        'angle' : player.rotation,
				//'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
}

function update(time, delta) {
  handleMove()
  var cursors = scene.input.keyboard.createCursorKeys();
  var pointer = scene.input.activePointer;
  if (cursors.left.isDown) {
    socket.emit('leftisDown',{
				'id': id
			});
    //player.setRotation(player.rotation - 0.1);
  } else if (cursors.right.isDown) {
    socket.emit('rightisDown',{
				'id': id
			});
    //player.setRotation(player.rotation + 0.1);
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
    socket.emit('downisDown',{
				'id': id
			});
    //player.thrustBack(0.05);
    
    //scoreText.x=pointer.x;
    //scoreText.y=pointer.y;
  }
  if (cursors.up.isDown) {
    socket.emit('upisDown',{
				'id': id
			});
    //player.thrust(0.05);
  }
}
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
		
		if(! (data.id in clients)){
			// тут создать танк игрока 2
			clients[data.id] = new tank(scene, 200, 200, "tank");
		}
		
		// Is the user drawing?
		if(data.id != id && clients[data.id]){
			clients[data.id].x = data.x;
      clients[data.id].y = data.y;
      clients[data.id].rotation = data.angle;
		}
		
		// Saving the current client state
		//clients[data.id] = data;
		//clients[data.id].updated = $.now();
	});
socket.on('tankCreate', function (data) {
		if(! (data.id in clients)){
			// тут создать танк игрока 2
			clients[data.id] = new tank(scene, 200, 200, "tank");
      clients[data.id].setFrictionAir(0.5);
      clients[data.id].setPosition(500, 500);
      clients[data.id].setMass(5);
      clients[data.id].setCollisionCategory(cat1);
		}
	});