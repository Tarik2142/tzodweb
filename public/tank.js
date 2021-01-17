class gunn extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this).setScale(0.8, 0.8);
  }
}

class tank extends Phaser.Physics.Matter.Sprite {
  bullet;
  bulletSpeed;
  playerDist;
  speed;
  armor;
  constructor(scene, x, y, texture, frame, walls) {
    this.bulletSpeed = 50;
    this.bullet = [];
    this.playerDist = 25;
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this).setScale(0.8, 0.8);
  var cat1 = scene.matter.world.nextCategory();
  var cat2 = scene.matter.world.nextCategory();
  this.setFrictionAir(0.5);
  this.setMass(5);
  this.setCollisionCategory(cat1);
  this.gun = new gunn(scene, x, y, 'gun', 0);
  this.gun.setCollisionCategory(cat2);
  this.gun.setCollidesWith(cat2);
  this.gun.depth = 1;
  this.joint = scene.matter.add.constraint(this, this.gun, 0, 0);
  }
  update() {}
  kill(){
    this.gun.destroy();
    delete this.gun;
//scene.matter.composite.remove(scene.matter.world, this.joint, true);
    this.destroy();
    delete this;
  }
  function fireBullet(game, player) {
  //addMass(x, y, r, sides, Vx, Vy)
  var i = this.bullet.length;
  log('bullet mass len = ' + i);
  var angle = this.rotation;
  this.bullet.push();
  this.bullet[i] = game.matter.bodies.circle(
    this.x + this.playerDist * Math.cos(angle),
    this.y + this.playerDist * Math.sin(angle),
    20
  );
  //log(game.matter.add.gameObject(bullet[i]));
  this.bullet[i].body.rotation = angle;
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
    if (pair.bodyA.gameObject !== null){// спс
      if (pair.bodyA.gameObject.name == "platform") {
        //setTimeout(function() {
          if (this.bullet[i]) {
            this.bullet[i].setVelocity(0, 0);
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
    if (this.bullet[i]) {
      
      //bullet[i].setVisible(false);
      this.bullet[i].destroy();
    }
  }, 2000);
  // game.matter.setVelocity(bullet[i], {
  //   x: player.body.velocity.x + speed,
  //  y: player.body.velocity.y + speed
  // });

  game.matter.world.add(game.matter.world, this.bullet[i]);
  
  this.bullet[i].setVelocity(
    this.body.velocity.x + this.bulletSpeed * Math.cos(angle),
    this.body.velocity.y + this.bulletSpeed * Math.sin(angle)
  );
  }
}