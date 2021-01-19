
var tzodCollision = {
  update: function(event){
    
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
    
    function handleBullet(body){
      
    }
    
    function handleLabelCollisions(evnt){
      
    }
    
    for (var i = 0; i < event.pairs.length; i++){
      var pairs = event.pairs[i]
      // console.log("event:");
      // console.log(pairs[i]);
      if (pairs.bodyA.label){
       handleLabelCollisions();
      }
      if (pairs.bodyB.label){
        handleLabelCollisions();
      }
    }
  },
  
  bullet: function(){
    
  }
}