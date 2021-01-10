var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  parent: 'tanks',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var physics;

class tank {
  name;
  currentSpeed = 0;
  movebackSpeed = 0;
  canFire = true;
  tankBase;
  gun;
  constructor(walls) {
    this.tankBase = physics.add.sprite(100, 450, 'tank');
    this.tankBase.setCollideWorldBounds(true);
    this.tankBase.setOrigin(0.5, 0.5);
    this.gun = physics.add.sprite(0, 0, 'gun');
    this.gun.setOrigin(0.5, 0.5);
    this.gun.setCollideWorldBounds(true);
    physics.add.collider(this.tankBase, walls);
    physics.add.collider(this.gun, walls);
    this.update();
  }
  update() {
    this.gun.x = this.tankBase.x;
    this.gun.y = this.tankBase.y;
    this.gun.angle = this.tankBase.angle;
  }
  addColider(walls) {
    physics.add.collider(this.tankBase, walls);
    physics.add.collider(this.gun, walls);
  }
}

var currentSpeed = 0;
var movebackSpeed = 0;
var lastFired = 0;
var canFire = true;

function preload() {
  physics = game.scene.keys.default.physics;
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.image('tank', 'assets/tanks/tank1.png',);
  this.load.image('gun', 'assets/tanks/turret2.png');

}

function create() {
  this.physics.world.on('worldbounds', onWorldBounds);
  this.add.image(400, 300, 'sky');
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  player = new tank(platforms);

  player2 = new tank(player);
  player.addColider(player2.tankBase);

  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    collideWorldBounds: true,
    setXY: { x: 0, y: 0, stepX: 0 }
  });

  stars.children.iterate(function (child) {

    child.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
    child.visible = false;

  });

  Phaser.Actions.Call(stars.getChildren(), function (bullet) {
    bullet.body.onWorldBounds = true;
  });

  this.physics.add.collider(stars, platforms, collectStar);
  // this.physics.add.overlap(platforms, stars, collectStar, null, this);
  function collectStar(player, star) {
    player.disableBody(true, true);
  }
}

function onWorldBounds(body) {
  var bullet = body.gameObject;
  //console.log(bullet);
  bullet.disableBody(true, true);
}

function fireCd(time) {
  canFire = false;
  setTimeout(function () {
    canFire = true;
  }, 500);
}

function update(time, delta) {
  cursors = this.input.keyboard.createCursorKeys();
  var pointer = this.input.activePointer;
  if (cursors.left.isDown) {
    player.tankBase.angle -= 4;
  }
  else if (cursors.right.isDown) {
    player.tankBase.angle += 4;

  }

  if (pointer.isDown) {
    stars.children.iterate(function (child) {
      if (!child.visible && canFire) {
        fireCd();
        child.enableBody();
        child.visible = true;
        child.angle = player.tankBase.angle;
        child.x = player.tankBase.x;
        child.y = player.tankBase.y;
        physics.velocityFromRotation(player.tankBase.rotation, 800, child.body.velocity);
      }
    });
  }
  if (cursors.down.isDown) {
    movebackSpeed = 300;
  }
  if (cursors.up.isDown) {
    currentSpeed = 300;

  } else {
    if (currentSpeed > 0) {
      currentSpeed -= 15;
    }
    if (movebackSpeed > 0) {
      movebackSpeed -= 5;
    }
  }

  if (currentSpeed > 0) {
    this.physics.velocityFromRotation(player.tankBase.rotation, currentSpeed, player.tankBase.body.velocity);
    this.physics.velocityFromRotation(player.tankBase.rotation, currentSpeed, player.gun.body.velocity);
  } else {
    if (movebackSpeed > 0) {
      this.physics.velocityFromRotation(player.tankBase.rotation, -movebackSpeed, player.tankBase.body.velocity);
      this.physics.velocityFromRotation(player.tankBase.rotation, -movebackSpeed, player.gun.body.velocity);
    } else {
      player.tankBase.setVelocity(0);
    }
  }
  //player.update();
}
