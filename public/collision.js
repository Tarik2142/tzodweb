var wallTypes = {
  concrite: "Rectangle Body",
  bricks: "Rectangle Body"
}


var tzodCollision = {
  update: function(event){
    
    function handleCollisions(bodyA, bodyB){
      logObj("bodyA", bodyA);
      logObj("bodyB", bodyB);
      function getGO(body){
        if (body.gameObject){
          return true;
        }else{
          return false;
        }
      }
      
      var isBa = isBullet(bodyA);
      var isBb = isBullet(bodyB);
      
      if(isTank(bodyA) && isBullet(bodyB)){
        if (getGO(bodyA)){
          bodyA.gameObject.damage(10);
        }
      }
      
      if (isBa && isBb){ //2 пули убить обе
        if (getGO(bodyA)) bodyA.gameObject.destroy(true);
        if (getGO(bodyB)) bodyB.gameObject.destroy(true);
      }else{//1 пуля
        
//         if (isBa){//убить пулю
//             if (getGO(bodyA)) bodyA.gameObject.destroy(true);
          
//         }else if (isBb){//убить пулю
//             if (getGO(bodyB)) bodyB.gameObject.destroy(true);
//         }
        
        var damagg=11;
        if (isBa){
          damagg=101;
          if (getGO(bodyA)) bodyA.gameObject.destroy(true);
        }
        var tileBody = bodyA.label === "collides" ? bodyA : bodyB;
        if (tileBody.gameObject) {
          
          var tileWrapper = tileBody.gameObject;
          if (tileWrapper.tile) {
            var tile = tileWrapper.tile;
            if (tile.properties.hp!=0) { 
              for(var damag=damagg;damag>0;){
                var hp= tile.properties.hp
                if (tile.properties.hp>0){
                  tile.properties.hp=tile.properties.hp-damag;
                  damag=damag-hp
                }else if (tile.properties.hp<=0){
                  if (tile.properties.nextlauer<1){
                    destroyTile(tile);
                    damag=-1;
                  }else{
                    belowLayer.putTileAtWorldXY(tile.properties.nextlauer, tile.x*32, tile.y*32).setCollision(true);
                    tile.properties.hp=belowLayer.gidMap[1].tileProperties[tile.properties.nextlauer-1].hp;
                    tile.properties.nextlauer=belowLayer.gidMap[1].tileProperties[tile.properties.nextlauer-1].nextlauer;
                  }
                } 
              }
              
            }
          } 
        scene.matter.world.convertTilemapLayer(belowLayer);
        }
      } 
    }
    
    function isTank(body){
        if(body.label){
          if (body.label.indexOf('tank') != -1){
            return true;
          }
        }else{
          return false;
        }
    }
    
    function isWall(body){
        if(body.label){
          if (body.label.indexOf('Rectangle Body') != -1){
            return true;
          }
        }else{
          return false;
        }
    }
    
    function isBullet(body){
        if(body.label){
          //log(body.label);
          if (body.label.indexOf('type_bullet') != -1){
            return true;
          }
        }else{
          return false;
        }
    }
      event.pairs.forEach(({ bodyA, bodyB }) => {
        handleCollisions(bodyA, bodyB);  
  }); 
  }
}