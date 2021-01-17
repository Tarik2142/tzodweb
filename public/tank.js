const scale = 0.8;

class gunn extends Phaser.Physics.Matter.Sprite {
  canFire;
  fireTimeout;
  bullet;
  bulletSpeed;
  scene;
  playerDist;

  constructor(scene, x, y, texture, frame) {
    super(scene.matter.world, x, y, texture);

    this.fireTimeout = 500;
    this.canFire = true;
    this.bulletSpeed = 50;
    this.bullet = new Array();
    this.playerDist = 50;
    this.scene = scene;

    scene.add.existing(this).setScale(scale, scale).setName('tank' + id);
  }

  fireBullet() {
    //log(this.canFire);
    if (this.canFire) {
      this.fireCd();
      //addMass(x, y, r, sides, Vx, Vy)
      var i = this.bullet.length;
      log("bullet mass len = " + i);
      var angle = this.rotation;
      this.bullet.push();
      this.bullet[i] = this.scene.matter.add.sprite(
        this.x + this.playerDist * Math.cos(angle),
        this.y + this.playerDist * Math.sin(angle), 'crate'
      );
      //log(game.matter.add.gameObject(bullet[i]));
      this.bullet[i].rotation = angle;
      this.bullet[i].setMass(0.01);
      this.bullet[i].setFriction(0, 0, 0);
      // bullet[i].setOnCollide(function(){
      //   setTimeout(function(){
      //     if (bullet[i]){
      //       bullet[i].destroy();
      //     }
      //   }, 10);
      // });

      this.bullet[i].setOnCollide(pair => {
        if (pair.bodyA.gameObject) {
          // спс
          if (pair.bodyA.gameObject.name != 'tank' + id) {
            //setTimeout(function() {
            if (this.bullet[i]) {
              //this.bullet[i].setVelocity(0, 0);
              //bullet[i].setVisible(false);
              this.bullet[i].destroy();
            }
            //}, 5);
          }
        }

        // pair.bodyA
        // pair.bodyB
      });
      var that = this;
      setTimeout(function() {
        //log(that.bullet);
        if (that.bullet[i]) {
          //bullet[i].setVisible(false);
          that.bullet[i].destroy();
          //that.bullet.splice(i, 1);//почистить
        }
      }, 1000);
      // game.matter.setVelocity(bullet[i], {
      //   x: player.body.velocity.x + speed,
      //  y: player.body.velocity.y + speed
      // });

      //this.scene.matter.world.add(this.scene.matter.world, this.bullet[i]);

      this.bullet[i].setVelocity(
        this.body.velocity.x + this.bulletSpeed * Math.cos(angle),
        this.body.velocity.y + this.bulletSpeed * Math.sin(angle)
      );
    }
  }

  fireCd() {
    this.canFire = false;
    var that = this;
    setTimeout(function() {
      that.canFire = true;
    }, that.fireTimeout);
  }
}

class tank extends Phaser.Physics.Matter.Sprite {
  speed;
  armor;

  constructor(scene, x, y, texture, frame, walls) {
    super(scene.matter.world, x, y, texture);

    scene.add.existing(this).setScale(scale, scale).setName('tank' + id);
    var cat1 = scene.matter.world.nextCategory();
    var cat2 = scene.matter.world.nextCategory();
    this.setFrictionAir(0.5);
    this.setMass(5);
    this.setCollisionCategory(cat1);
    this.gun = new gunn(scene, x, y, "gun", 0);
    this.gun.setCollisionCategory(cat2);
    this.gun.setCollidesWith(cat2);
    this.gun.depth = 1;
    this.joint = scene.matter.add.constraint(this, this.gun, 0, 0);
  }

  fire() {
    if (this.gun) {
      //есть пушка
      this.gun.fireBullet();
    }
  }

  update() {}

  kill() {
    this.gun.destroy();
    delete this.gun;
    //scene.matter.composite.remove(scene.matter.world, this.joint, true);
    this.destroy();
    delete this;
  }
}
