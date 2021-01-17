const scale = 1;

var guns = {
  heavy: {//башена пушка
    texture: 'gun',
    frame: 0,
    name: 'heavy Gun',
    dmg: 51,
    reload: 1000, //скорость перезарядки
    speed: 10,//скорость снаряда
    gunRotationSpd: 20,//скорость поворота башні
    baseRotationSpd: 20,//скорость поворота танка
    offset: 60,//отступ от танка при вистреле
    baseSpeed: 20,//скорость танка
    armor: 60//бронька
  }
}

class gunn extends Phaser.Physics.Matter.Sprite {
  canFire;
  bullet;
  scene;
  gunType;

  constructor(scene, x, y, type) {
    super(scene.matter.world, x, y, type.texture);
    
    this.gunType = type;
    this.canFire = true;
    this.bullet = new Array();
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
      //this.bullet.push();
      this.bullet[i] = this.scene.matter.add.sprite(
        this.x + this.gunType.offset * Math.cos(angle),
        this.y + this.gunType.offset * Math.sin(angle), 'crate'
      );
      //log(game.matter.add.gameObject(bullet[i]));
      this.bullet[i].rotation = angle;
      this.bullet[i].setMass(0.00001);
      this.bullet[i].setFriction(0, 0, 0);
      this.bullet[i].setName("heavi");
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
            //log(pair.bodyA.gameObject.name);
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
  armor;
  nickname;
  updater;

  constructor(scene, x, y, texture, startGun) {
    super(scene.matter.world, x, y, texture);

    scene.add.existing(this).setScale(scale, scale).setName('tank' + id);
    var cat1 = scene.matter.world.nextCategory();
    var cat2 = scene.matter.world.nextCategory();
    this.setFrictionAir(0.5);
    this.setMass(5);
    this.setCollisionCategory(cat1);
    if (startGun){
      this.gun = new gunn(scene, x, y, startGun);
      this.gun.setCollisionCategory(cat2);
      this.gun.setCollidesWith(cat2);
      this.gun.depth = 1;
      this.joint = scene.matter.add.constraint(this, this.gun, 0, 0);
    }
    this.nickname = scene.add.text(16, 16, 'player' + id, {
        fontSize: '14px',
        padding: { x: 0, y: 0 },
        //backgroundColor: '#000000'
        //fill: '#ffffff'
    });
    this.nickname.setScrollFactor(0);
    log(this.nickname);
    var that = this;
    /*this.updater = scene.matter.world.on('beforeupdate', function(time, delta){//ник за игроком
      that.nickname.x = that.x - 25;
    that.nickname.y = that.y - 50;
    }, this);*/
  }
  
  setNick(text){
    this.nickname.text = text;
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
    this.gun.destroy();
    delete this.gun;
    //scene.matter.composite.remove(scene.matter.world, this.joint, true);
    this.destroy();
    delete this;
  }
}
