var wallTypes = {
  cement: "Rectangle Body",
  bricks: "Rectangle Body"
}


var tzodCollision = {
  update: function(event){
    
    function handleLabelCollisions(evnt){
      handleBullet(evnt);
    }
    
    function handleBullet(event){
      var bodyA = event.bodyA;
      var bodyB = event.bodyB;
      if (isBullet(bodyA) && isBullet(bodyB)){
        
      }
    }
    
    function isWall(body){
      if (body){
        if(body.label){
          if (body.label == 'Rectangle Body'){
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
          if (body.label == 'bullet'){
            return true;
          }
        }else{
          return false;
        }
      }else{
        return false;
      }
    }
    
    for (var i = 0; i < event.pairs.length; i++){
      var pair = event.pairs[i]
      // console.log("event:");
      // console.log(pair);
      if (pair.bodyA.label){
       handleLabelCollisions(pair);
      }
      if (pair.bodyB.label){
        handleLabelCollisions(pair);
      }
    }
  },
  
  bullet: function(){
    
  }
}