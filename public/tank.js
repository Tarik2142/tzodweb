class gunn extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this).setScale(0.8, 0.8);
  }
}

class tank extends Phaser.Physics.Matter.Sprite {
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
}