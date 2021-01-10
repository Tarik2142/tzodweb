var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
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
var scene;

class gun {
  constructor() {

  }
}

class tank2 extends Phaser.Physics.Arcade.Sprite {

  gun;
  name;
  currentSpeed = 0;
  movebackSpeed = 0;
  canFire = true;

  constructor(scene, x, y, texture, frame, walls) {

    super(scene, x, y, texture, frame);

    this.scene = scene;

    //scene DisplayList and UpdateList to add a game to

    this.scene.add.existing(this);

    this.scene.physics.world.enable(this);

    this.setTexture(texture, frame);

    this.setPosition(x, y);

    this.setSize(1, 1);

    this.setOffset(0, 0);
    this.setActive(true);
    this.gun = physics.add.sprite(0, 0, 'gun');
    this.gun.setOrigin(0.5, 0.5);
    this.gun.setCollideWorldBounds(true);
    scene.physics.add.collider(this.body, walls);
    scene.physics.add.collider(this.gun, walls);
    //scene.sys.updateList.add(this);

  }

  fireCd(time) {
    this.canFire = false;
    setTimeout(function () {
      this.canFire = true;
    }, time);
  }

  preUpdate() {
    this.update(); // Comment this and update stop working
  }

  update() {
    this.gun.x = this.x;
    this.gun.y = this.y;
    this.gun.angle = this.angle;
    //

    var cursors = scene.input.keyboard.createCursorKeys();
    var pointer = scene.input.activePointer;
    if (cursors.left.isDown) {
      this.angle -= 4;
    }
    else if (cursors.right.isDown) {
      this.angle += 4;

    }

    if (pointer.isDown) {
      stars.children.iterate(function (child, player) {
        if (!child.visible && canFire) {
          fireCd(1000);
          child.enableBody();
          child.visible = true;
          child.angle = player.angle;
          child.x = player.x;
          child.y = player.y;
          physics.velocityFromRotation(player.rotation, 800, child.body.velocity);
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
      this.scene.physics.velocityFromRotation(this.rotation, currentSpeed, this.body.velocity);
      this.scene.physics.velocityFromRotation(this.rotation, currentSpeed, this.gun.body.velocity);
    } else {
      if (movebackSpeed > 0) {
        this.scene.physics.velocityFromRotation(this.rotation, -movebackSpeed, this.body.velocity);
        this.scene.physics.velocityFromRotation(this.rotation, -movebackSpeed, this.gun.body.velocity);
      } else {
        this.setVelocity(0);
      }
    }
    //player.update();

    //
  }

}

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
    //scene.sys.updateList.add(this);
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
  scene = game.scene.keys.default;
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

  testTank = new tank2(this, 200, 200, 'tank', 0, platforms);

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

}
