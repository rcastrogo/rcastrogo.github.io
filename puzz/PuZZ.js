/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />


Pol.createNamespace('PuZZGame.Dialogs', this);
// ==================================================================================================== 
//
// PuZZGame.SpriteSheets.SpriteSheet01
//
// ====================================================================================================
Pol.createNamespace('PuZZGame.SpriteSheets', this);
PuZZGame.SpriteSheets.SpriteSheet01 = {  
  '128x32-Ground'     : new Pol.Core.Math.Rect(830,198,128,32)
}

Pol.createNamespace('PuZZGame.Puzzles', this);
PuZZGame.Puzzles.currentIndex = -1;
PuZZGame.Puzzles.Next = function(){
  var names = ['BobEsponja', 'PeppaPig', 'Cocodrilo', 'Orangutan', 'Pez.Payaso', 'Globos', 'Pocoyo', 'Dora', 'HelloKity', 'Pollito', 'Castillo'];
  PuZZGame.Puzzles.currentIndex += 1;
  PuZZGame.Puzzles.currentIndex %= names.length;
  return names[PuZZGame.Puzzles.currentIndex];
}

PuZZGame.Puzzles.RandomLayout = function(){
  var __names = [
    { rows : 2, cols : 2},
    { rows : 3, cols : 3},
    { rows : 4, cols : 4},
    { rows : 4, cols : 5},    
    { rows : 3, cols : 2},
    { rows : 5, cols : 5},
    { rows : 4, cols : 3},   
  ]

  return __names[ Pol.Core.Math.Random(__names.length-1,0)] ;
}


Pol.createNamespace('PuZZGame.Backgrounds', this);
PuZZGame.Backgrounds = { Images : [ 'img/1.jpg', 'img/2.jpg', 'img/3.jpg', 'img/4.jpg', 'img/5.jpg', 'img/6.jpg', 'img/7.jpg', 'img/8.jpg' ],
                         Index  : -1,
                         NextImageUrl : function(){
                           this.Index += 1;
                           this.Index %= this.Images.length;
                           return this.Images[this.Index];
                         },
                         ImageUrl : function(index){                           
                           return this.Images[index % this.Images.length];
                         } 
}



PuZZGame.ParticleSystem = function(size){

  var _that = {};
  var _particles = new Array(size);
  var _time = 0;

  var _initParticle = function(index, o){
    var particle = _particles[index] || {}; 
    particle.position = new Pol.Core.Math.Vector2(o.x, o.y);
    particle.color    = o.color;
    particle.radius   = Pol.Core.Math.Random(15,4);
    particle.velocity = new Pol.Core.Math.Vector2(1, 1)
                                          .rotate(Math.random() * Math.PI * 2)
                                          .mul( Pol.Core.Math.Random(650, 450) );
    particle.seed     = Math.random()* 3.14,
    particle.period   = Math.random()*6
    particle.ratio    = 1.0;
    particle.oLife    = particle.life = 0.5 + (Math.random() * 3);
    particle.dead     = false;
    return _particles[index] = particle;
  }

        
  _that.update = function(dt){
    _time += dt;
    _particles.forEach( function(particle){        
      if(!particle || particle.dead) return;
      particle.life -= dt;
      particle.dead = particle.life<0.0 ;      
      particle.position.x += dt * particle.velocity.x;
      particle.position.y += dt * particle.velocity.y; 
      particle.velocity.y += 500.2 * dt            
      particle.velocity.mul(.98);
      particle.angle = particle.seed + _time * -particle.period;;               
    });
  }

  _that.draw = function(ctx){
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';    
    _particles.forEach( function(particle){
      if( !particle || particle.dead) return;
      ctx.fillStyle   = particle.color;    
      ctx.font        = (particle.radius * 8) + 'px Segoe UI Symbol';
      ctx.globalAlpha = particle.life / particle.oLife;

      ctx.translate(particle.position.x, particle.position.y);
      ctx.rotate(particle.angle);
      ctx.fillText('★', 0, 0);
      ctx.strokeText('★', 0, 0);
      ctx.rotate(-particle.angle);                 
      ctx.translate(-particle.position.x, -particle.position.y);

      ctx.globalAlpha = 1.0;              
    });
    // ctx.beginPath();
    // ctx.arc(particle.position.x, particle.position.y, particle.radius, 0, 2 * Math.PI, false);
    // ctx.closePath();
    //ctx.fill(); 
  }

  _that.createParticlesAt = function(position, count){
    var __count = 0;
    while(__count<count){
      _initParticle( __count++, position);        
    }   
  }
  return _that;
}


// ################################################################################################################
// TO DO 
// ################################################################################################################
/*

- Sounds: pool, background, ie, music and sounds, icon
- Save to local storage
- Canvas to canvas

- Logo design
- RandonLayouts,

*/
