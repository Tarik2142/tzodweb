class gunn extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this).setScale(0.8, 0.8);
  }
}

class tank extends Phaser.Physics.Matter.Sprite {
  //bullet = [];
  //playerDist = 25;
  speed;
  armor;
  constructor(scene, x, y, texture, frame, walls) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this).setScale(0.8, 0.8);
    //log('tank = ');
    //log(this);
  var cat1 = scene.matter.world.nextCategory();
  var cat2 = scene.matter.world.nextCategory();
  this.setFrictionAir(0.5);
  this.setMass(5);
  this.setCollisionCategory(cat1);
  this.gun = new gunn(scene, x, y, 'gun', 0);
    //log('gun = ');
    //log(this.gun);
  this.gun.setCollisionCategory(cat2);
  this.gun.setCollidesWith(cat2);
  this.gun.depth = 1;
  this.joint = scene.matter.add.constraint(this, this.gun, 0, 0);
  }
  update() {}
  kill(){
    this.gun.destroy();
    delete this.gun;
    //kill joint
    //this.joint.destroy();
//scene.matter.composite.remove(scene.matter.world, this.joint, true);
    this.destroy();
    delete this;
  }
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

  game.matter.world.add(game.matter.world, bullet[i]);
  
  bullet[i].setVelocity(
    player.body.velocity.x + speed * Math.cos(angle),
    player.body.velocity.y + speed * Math.sin(angle)
  );
  }
}