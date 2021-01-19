var wallTypes = {
  cement: "Rectangle Body",
  bricks: "Rectangle Body"
}


var tzodCollision = {
  update: function(event){
    
    function handleLabelCollisions(bodyA, bodyB){
      
    }
    
    function handleBullets(bodyA, bodyB){
      var isBa = isBullet(bodyA);
      var isBb = isBullet(bodyB);
      if (isBa && isBb){ //2 пули убить обе
        bodyA.gameObject.destroy(true);
        bodyB.gameObject.destroy(true);
      }else{//1 пуля
        if (isBa){//убить пулю
          bodyA.gameObject.destroy(true);
        }else if (isBb){//убить пулю
          bodyB.gameObject.destroy(true);
        }
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