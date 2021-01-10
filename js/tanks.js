
EnemyTank = function (index, game, player, bullets) {

    var x = Phaser.Math.Between(0, 800);
    var y = Phaser.Math.Between(0, 600);

    this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.physics.add.sprite(x, y, 'enemy', 'shadow');
    this.tank = game.physics.add.sprite(x, y, 'enemy', 'tank1');
    this.turret = game.physics.add.sprite(x, y, 'enemy', 'turret');

    this.shadow.setOrigin(0.5);
    this.tank.setOrigin(0.5);
    this.turret.setOrigin(0.3, 0.5);

    this.tank.name = index.toString();
    // this.tank.body.immovable = false;
    this.tank.setCollideWorldBounds(true);
    this.tank.setBounce(0.2);

    this.tank.angle = Math.random();

    game.physics.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);

};

EnemyTank.prototype.damage = function () {

    this.health -= 1;

    if (this.health <= 0) {
        this.alive = false;

        this.shadow.kill();
        this.tank.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyTank.prototype.update = function () {

    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    //this.turret.rotation = Phaser.Math.Angle(this.tank.x, this.tank.y, this.player.x, this.player.y);

    // if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300) {
    //     if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
    //         this.nextFire = this.game.time.now + this.fireRate;

    //         var bullet = this.bullets.getFirstDead();

    //         bullet.reset(this.turret.x, this.turret.y);

    //         bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
    //     }
    // }

};

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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {

    this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json');
    this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json');
    this.load.image('logo', 'assets/tanks/logo.png');
    this.load.image('bullet', 'assets/tanks/bullet.png');
    this.load.image('earth', 'assets/tanks/scorched_earth.png');
    this.load.spritesheet('kaboom', 'assets/tanks/explosion.png', {
        frameWidth: 64,
        frameHeight: 64
    });

}

var land;

var shadow;
var tank;
var turret;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var logo;

var currentSpeed = 0;
var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;

function create() {

    //  Resize our game world to be a 2000 x 2000 square
    this.cameras.main.setBounds(-1000, -1000, 2000, 2000);

    //  Our tiled scrolling background
    land = this.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;

    //  The base of our tank
    tank = this.add.sprite(0, 0, 'tank', 'tank1');
    tank.setOrigin(0.5, 0.5);
    //tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  This will force it to decelerate and limit its speed
    //this.physics.enable(tank, Phaser.Physics.ARCADE);
    //tank.body.drag.set(0.2);
    //tank.body.maxVelocity.setTo(400, 400);
    //tank.body.collideWorldBounds = true;

    //  Finally the turret that we place on-top of the tank body
    turret = this.add.sprite(0, 0, 'tank', 'turret');
    turret.setOrigin(0.3, 0.5);

    //  The enemies bullet group
    enemyBullets = this.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');
    enemyBullets.children.each(function (bullet) {
        bullet.setOrigin(0.5, 0.5);
    }, this);

    // enemyBullets.setAll('anchor.x', 0.5);
    // enemyBullets.setAll('anchor.y', 0.5);
    // enemyBullets.setAll('outOfBoundsKill', true);
    // enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 20;
    enemiesAlive = 20;

    for (var i = 0; i < enemiesTotal; i++) {
        enemies.push(new EnemyTank(i, this, tank, enemyBullets));
    }

    //  A shadow below our tank
    shadow = this.add.sprite(0, 0, 'tank', 'shadow');
    shadow.setOrigin(0.5, 0.5);

    //  Our bullet group
    bullets = this.add.group();
    bullets.enableBody = true;
    // bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    // bullets.setAll('anchor.x', 0.5);
    // bullets.setAll('anchor.y', 0.5);
    // bullets.setAll('outOfBoundsKill', true);
    // bullets.setAll('checkWorldBounds', true);
    bullets.children.each(function (bullet) {
        bullet.setOrigin(0.5, 0.5);
    }, this);

    //  Explosion pool
    explosions = this.add.group();

    // for (var i = 0; i < 10; i++) {
    //     var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
    //     explosionAnimation.anchor.setTo(0.5, 0.5);
    //     explosionAnimation.animations.add('kaboom');
    // }

    this.children.bringToTop(tank);
    this.children.bringToTop(turret);

    //logo = this.add.sprite(0, 200, 'logo');
    //logo.fixedToCamera = true;

    //this.input.onDown.add(removeLogo, this);

    // this.camera.follow(tank);
    // this.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    //this.camera.focusOnXY(0, 0);

    cursors = this.input.keyboard.createCursorKeys();

}

// function removeLogo() {

//     this.input.onDown.remove(removeLogo, this);
//     logo.kill();

// }

function update() {

    this.physics.add.overlap(enemyBullets, tank, bulletHitPlayer, null, this);

    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].alive) {
            enemiesAlive++;
            this.physics.collide(tank, enemies[i].tank);
            this.physics.add.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }

    if (cursors.left.isDown) {
        tank.angle -= 4;
    }
    else if (cursors.right.isDown) {
        tank.angle += 4;
    }

    if (cursors.up.isDown) {
        //  The speed we'll travel at
        currentSpeed = 300;
    }
    else {
        if (currentSpeed > 0) {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0) {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    //land.tilePosition.x = -this.camera.x;
    //land.tilePosition.y = -game.camera.y;

    //  Position all the parts and align rotations
    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;

    turret.x = tank.x;
    turret.y = tank.y;

    turret.rotation = this.physics.angleToPointer(turret);

    if (game.input.activePointer.isDown) {
        //  Boom!
        fire();
    }

}

function bulletHitPlayer(tank, bullet) {

    bullet.kill();

}

function bulletHitEnemy(tank, bullet) {

    bullet.kill();

    var destroyed = enemies[tank.name].damage();

    if (destroyed) {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }

}

function fire() {

    if (game.time.now > nextFire && bullets.countDead() > 0) {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
    }

}

// function render() {

//     // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
//     game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);

// }

