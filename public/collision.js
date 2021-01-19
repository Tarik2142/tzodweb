var wallTypes = {
  cement: "Rectangle Body",
  bricks: "Rectangle Body"
}


var tzodCollision = {
  update: function(event){
    
    function handleLabelCollisions(bodyA, bodyB){
      
    }
    
    function handleBullets(bodyA, bodyB){
      if (isBullet(bodyA) && isBullet(bodyB)){ //2 пули
        log(bodyA);
        //bodyA.destroy();
        scene.matter.world.remove(scene.matter.world.localWorld, bodyA);
        bodyB.gameObject.body.destroy(true);
      }else{
        
      }
    }
    
    function isWall(body){
      if (body){
        if(body.label){
          if (body.label.indexOf('Rectangle Body') != -1){
            return true;
          }
        }else{
          return false;
        }
      }else{
        return false;
      }
    }
    
    function isBullet(body){
      if (body){
        if(body.label){
          //log(body.label);
          if (body.label.indexOf('Bullet') != -1){
            return true;
          }
        }else{
          return false;
        }
      }else{
        return false;
      }
    }
      event.pairs.forEach(({ bodyA, bodyB }) => {
      //   if (bodyA.label && bodyB.label){
      //  handleLabelCollisions(bodyA, bodyB);
      // }
        handleBullets(bodyA, bodyB);
     
  });
      // console.log("event:");
      // console.log(pair);
    
  }
}