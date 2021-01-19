var wallTypes = {
  cement: "Rectangle Body",
  bricks: "Rectangle Body"
}


var tzodCollision = {
  update: function(event){
    
    function handleLabelCollisions(evnt){
      
    }
    
    function handleBullet(body){
      
    }
    
    function isWall(body){
      f (body){
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
      console.log("event:");
      console.log(pairs);
      if (pair.bodyA.label){
       handleLabelCollisions(pairs);
      }
      if (pair.bodyB.label){
        handleLabelCollisions(pairs);
      }
    }
  },
  
  bullet: function(){
    
  }
}