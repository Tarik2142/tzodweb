
const scale = 1.2;

var guns = {
  heavy: {//башена пушка
    texture: 'heavy_gun',
    bulletTexture: 'heavy_gun_bullet',
    frame: 0,
    name: 'heavy Gun',
    dmg: 51,
    reload: 1000, //скорость перезарядки
    speed: 10,//скорость снаряда
    gunRotationSpd: 20,//скорость поворота башні
    baseRotationSpd: 20,//скорость поворота танка
    offset: 30,//отступ от танка при вистреле
    baseSpeed: 20,//скорость танка
    armor: 60,//бронька
    bulletLabel: 'bullet_heavy'
  }
}


class gunn extends Phaser.Physics.Matter.Sprite {
  canFire;
  bullet;
  scene;
  gunType;
  id;
  
  constructor(scene, x, y, type, id) {
    var label = 'tank' + id;
    super(scene.matter.world, x, y, type.texture, 0, {label: label, shape: 'circle', radius: 1});
    
    this.gunType = type;
    this.canFire = true;
    this.bullet = new Array();
    this.scene = scene;
    this.id = id;

    scene.add.existing(this).setScale(scale, scale);
  }

  fireBullet() {
    //log(this.canFire);
    if (this.canFire) {
      this.fireCd();
      var config = {
    label: guns.heavy.bulletLabel,
    shape: 'rectangle',
    //chamfer: 2,

    isStatic: false,
    isSensor: true,
    isSleeping: false,
    ignoreGravity: false,
    ignorePointer: false,

    sleepThreshold: 60,
    density: 0.001,
    restitution: 0,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,

    //force: { x: this.body.velocity.x + this.gunType.speed * Math.cos(angle), y: this.body.velocity.y + this.gunType.speed  * Math.sin(angle) },
    angle: this.rotation,
    torque: 0,

    collisionFilter: {
        group: 0,
        category: 0x0001,
        mask: 0xFFFFFFFF,
    },

    parts: [],

    // plugin: {
    //     attractors: [
    //         (function(bodyA, bodyB) { return {x, y}}),
    //     ]
    // },

    slop: 0.05,

    timeScale: 1
}

      //addMass(x, y, r, sides, Vx, Vy)
      var i = this.bullet.length;
      //log("bullet mass len = " + i);
      //if (i>5){this.bullet = new Array();i=0}
      var angle = this.rotation;
      //this.bullet.push();
      this.bullet[i] = this.scene.matter.add.sprite(
        this.x + this.gunType.offset * Math.cos(angle),
        this.y + this.gunType.offset * Math.sin(angle), guns.heavy.bulletTexture, 0, config
      );
      //log(game.matter.add.gameObject(bullet[i]));
      //this.bullet[i].rotation = angle;
      //this.bullet[i].setMass(0.00001);
      //this.bullet[i].setFriction(0, 0, 0);
      //this.bullet[i].setName("heavi");

//       this.bullet[i].setOnCollide(pair => {
//         if (pair.bodyA) {
//           // спс
//           if (pair.bodyA.label != 'tank' + id) {
//             log(pair.bodyA);
//             //log(pair.bodyA.gameObject.name);
//             //setTimeout(function() {
// //             if (this.bullet[i]) {
// //               //this.bullet[i].setVelocity(0, 0);
// //               //bullet[i].setVisible(false);
// //               this.bullet[i].destroy();
              
// //             }
//             //}, 5);
//           }
//         }

//         // pair.bodyA
//         // pair.bodyB
//       });
      // var that = this;
      // setTimeout(function() {
      //   //log(that.bullet);
      //   if (that.bullet[i]) {
      //     //bullet[i].setVisible(false);
      //     that.bullet[i].destroy();
      //     //that.bullet.splice(i, 1);//почистить
      //   }
      // }, 1000);
      // game.matter.setVelocity(bullet[i], {
      //   x: player.body.velocity.x + speed,
      //  y: player.body.velocity.y + speed
      // });

      //this.scene.matter.world.add(this.scene.matter.world, this.bullet[i]);

      this.bullet[i].setVelocity(
        this.body.velocity.x + this.gunType.speed * Math.cos(angle),
        this.body.velocity.y + this.gunType.speed  * Math.sin(angle)
      );
    }
    
  }

  fireCd() {
    this.canFire = false;
    var that = this;
    setTimeout(function() {
      that.canFire = true;
    }, that.gunType.reload);
  }
}

class tank extends Phaser.Physics.Matter.Sprite {
  speed;
  hp;
  armor;
  nickname;
  nickname2;
  updater;
  id;
  engineTrust;
  engineRotation;

  constructor(scene, x, y, texture, shape, startGun, nickname2, id) {
    var label = 'tank_' + id;
    super(scene.matter.world, x, y, texture, null, {label: label, shape: shape});
    this.nickname2 = nickname2;
    this.hp = 100;
    this.engineTrust = 0;
    this.engineRotation = 0;
    this.id = id;
    scene.add.existing(this).setScale(scale, scale);
    var cat1 = scene.matter.world.nextCategory();
    var cat2 = scene.matter.world.nextCategory();
    this.setFrictionAir(0.5);
    this.setMass(5);
    this.setCollisionCategory(cat1);
    if (startGun){
      this.gun = new gunn(scene, x, y, startGun, this.nickname2);
      this.gun.setCollisionCategory(cat2);
      this.gun.setCollidesWith(cat2);
      this.gun.depth = 1;
      this.joint = scene.matter.add.constraint(this, this.gun, 0, 0);
    }
    this.nickname = scene.add.text(16, 16, this.nickname2 + " [" + this.hp + "HP]", {
        fontSize: '14px',
        padding: { x: 0, y: 0 },
        //backgroundColor: '#000000'
        //fill: '#ffffff'
    });
    this.nickname.setScrollFactor(0);
    //log(this.nickname);
    var that = this;
    this.updater = scene.matter.world.on('beforeupdate', function(time, delta){//ник за игроком
      that.nickname.x = that.x - 25;
    that.nickname.y = that.y - 50;
    }, this);//*/
  }
  
  setNick(text){
    this.nickname.text = text;
  }
  
  damage(amount){//урон
    if(this.hp - amount <= 0){//умер
      //this.kill();
      //const id = this.id;
      log("killing tank width id: " + this.id);
      if (server) clientList.clientArr[this.id].setPosition(500, 500);
      this.hp = 100;
      this.setNick(this.nickname2 + " [" + this.hp + "HP]");
      //setTimeout(function(){
      //  if (server) clientList.clientArr[id].setPosition(30, 30);
      //}, 3000);
      //respawn
    }else{
      this.hp -= amount;
      this.setNick(this.nickname2 + " [" + this.hp + "HP]");
    }
    
  }

  fire() {
    if (this.gun) {
      //есть пушка
      this.gun.fireBullet();
    }
  }

  update() {
    
  }

  kill() {
    scene.matter.world.off('beforeupdate', null, this);
    this.nickname.destroy();
    this.updater = undefined;
    delete this.updater;
    this.nickname = undefined;
    delete this.nickname;
    scene.matter.world.removeConstraint(this.joint);
    this.gun.destroy();
    delete this.gun;
    this.destroy();
    delete this;
  }
}
