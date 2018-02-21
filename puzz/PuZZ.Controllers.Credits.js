/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />

// ==============================================================
//
// PuZZGame.StateControllers.CreditsController
//
// ==============================================================
PuZZGame.StateControllers.CreditsController = function(){
  
  var _time   = 0;
  var _states = Pol.Core.StateManager();  
  var _fadeControler;    
  var _InputManager;

  var _that       = { Update      : function(dt) { _time += dt; _states.state.update(dt); },
                      Draw        : function(ctx){ _states.state.draw(ctx); },
                      Deactivate  : function()  {},
                      Activate    : function(o) { 
                        if(!_InputManager){ 
                          _InputManager = Pol.Core.Game.InputManager;                          
                        }                         
                        __createParticles();
                        _metaBalls.init();
                        _states.setState('enter');
                      }};
                          
  // =============================================================================================================================================
  // 
  //  Enter
  // 
  // =============================================================================================================================================
  _states.enter.activate = function(){   
    _fadeControler = new Pol.Core.Game.FadeControler(500)
                                      .fadeUp( function(){ _states.setState('idle');} );    
  };
  _states.enter.update = function(dt) {
    __updateParticles(dt);
    _metaBalls.update(dt);
    _fadeControler.update(dt); 
  };
  _states.enter.draw = function(ctx){
    ctx.globalAlpha = _fadeControler.value/100;   
    __draw(ctx); 
    ctx.globalAlpha = 1; 
  };  

  // =============================================================================================================================================
  // 
  //  Leave
  // 
  // ============================================================================================================================================= 
  _states.leave.activate = function(o){          
    _fadeControler = new Pol.Core.Game.FadeControler(1000)
                                      .fadeDown( function(){                                        
                                        Pol.Core.Game.StateManager.SetState('Menu');                                                                                      
                                      });   
  };
  _states.leave.update = function(dt) { _fadeControler.update(dt); };
  _states.leave.draw   = function(ctx){
    ctx.globalAlpha = _fadeControler.value/100;
    __draw(ctx);             
    ctx.globalAlpha = 1;    
  }; 

  // =============================================================================================================================================
  // 
  //  Idle
  // 
  // =============================================================================================================================================
  _states.idle.activate = function(){  
    document.body.style.backgroundImage = 'url({0})'.format(PuZZGame.Backgrounds.ImageUrl(4));
    _time=0;
  };

  _states.idle.update = function(dt){   
    
    __updateParticles(dt);
    _metaBalls.update(dt);

    var __Data = _InputManager.Data;

    if(__Data.Tap || _time>18){       
      _states.setState('leave')  
    }      
        
    if(__Data.EndTap){   } 

    if(__Data.Move){   }


  };
  _states.idle.draw = function(ctx){
    __draw(ctx);             
  };  
  
   
  // ==================================================================
  //  Common Draw stuff
  // ==================================================================
  function __draw(ctx){

    _metaBalls.flip();
    ctx.drawImage(_metaBalls.context.canvas, 0, 0, Pol.Core.Game.GameWidth, Pol.Core.Game.GameHeight);

    
    ctx.translate(40, 100);
    ctx.scale(8,8);
    ctx.fillStyle = 'rgba(255,255,255,.4)';     
    _particles.forEach( function(p){
      ctx.globalAlpha = 1/Pol.Core.Math.Clamp( p.velocity[0] + p.velocity[1], 0.01, 1);
      __drawParticle(ctx, p);
    });
    ctx.globalAlpha = 1;
    ctx.scale(-8, -8);
    ctx.translate(-40, -100);
         
  }

  function __drawParticle(ctx, particle){       
    ctx.beginPath(); 
    ctx.arc(particle.position[0], particle.position[1], 1, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  }

  var _particles = [];
  function __createParticles(){

    var __context = Pol.Core.Drawing.createBuffer(150, 60, function(ctx){
      ctx.fillStyle= 'rgba(0,0,0,0)';
      ctx.fillRect(0,0,150,60)      
      ctx.font = '52px Moire ExtraBold';
      ctx.fillStyle= 'rgba(0,0,255,1)';
      ctx.textBaseline = 'top';
      ctx.fillText('P u z Z', 0, 0);
    }).getContext('2d');

    var imageData = __context.getImageData(0,0,150,60);
    _particles.length = 0;
    var __half_w = Pol.Core.Game.GameWidth>>1;
    var __half_h = Pol.Core.Game.GameHeight>>1;
    for (var x = 0; x < imageData.width; x++) {
      for (var y = 0; y < imageData.height; y++) {
          var pixelIndex = imageData.width * 4 * y + x * 4              
          var r = imageData.data[pixelIndex];
          var g = imageData.data[pixelIndex + 1];
          var b = imageData.data[pixelIndex + 2];
          var a = imageData.data[pixelIndex + 3]; 
          if(b!=0){
            var posX = ~~(Math.random() * Pol.Core.Game.GameWidth) - __half_w;
            var posY = ~~(Math.random() * Pol.Core.Game.GameHeight) - __half_h;
            _particles.push({
                  position    : [posX, posY],
                  origin      : [posX,posY], 
                  destination : [x, y],
                  velocity    : [0, 0]
            });
          }            
      }
    }             
  }

  function __updateParticles(dt){
    var __total = 0;
    var __half_w = Pol.Core.Game.GameWidth>>3;
    var __half_h = Pol.Core.Game.GameHeight>>3;
    for (var i = 0; i < _particles.length; i++) {
      var particle = _particles[i];
      particle.velocity[0] = (particle.destination[0] - particle.position[0]) * dt*1.5;
      particle.velocity[1] = (particle.destination[1] - particle.position[1]) * dt;
      if(Math.abs(particle.velocity[0] + particle.velocity[1]) < .0005){
        if(Pol.Core.Math.Random(10,0)>9){
          if(Math.sin(_time)>0){
            particle.position[0] = ~~(Math.random() * Pol.Core.Game.GameWidth) - __half_w; 
          }else{
            particle.position[1] = ~~(Math.random() * Pol.Core.Game.GameHeight) - __half_h; 
          }
        }        
      }else{
        particle.position[0] += particle.velocity[0];
        particle.position[1] += particle.velocity[1];
      }
    }
  }
  
  var _metaBalls = { 
    balls  : [],
    init   : function(){
      _metaBalls.context = Pol.Core.Drawing.createBuffer(150, 60, function(ctx){ }).getContext('2d');
      for( var x=0; x<3; x++){
        var __ball = { position    : { x : Pol.Core.Math.Random(0, 150), 
                                       y : Pol.Core.Math.Random(0, 60)},
                       velocity    : { x : Pol.Core.Math.Random(32, -32), 
                                       y : Pol.Core.Math.Random(32, -32)},
                       size        : Pol.Core.Math.Random(44, 18)
                     };
        __ball.gradient = _metaBalls.context.createRadialGradient(0, 0, 3, 0, 0, __ball.size);
        __ball.gradient.addColorStop(0, 'rgba(0,0,250,1)');
        __ball.gradient.addColorStop(1, 'rgba(0,0,155,0)');
        _metaBalls.balls.push( __ball);
      }
    },
    update : function(dt){
      _metaBalls.balls.forEach( function(b){
        b.position.x += b.velocity.x * dt;
        b.position.y += b.velocity.y * dt;
        if(b.position.x<0 || b.position.x>150){
          b.velocity.x  = -b.velocity.x;
        }
        if(b.position.y<0 || b.position.y>60){
          b.velocity.y  = -b.velocity.y;
        }
      });
    },
    flip   : function(){

      var __ctx = _metaBalls.context;
      __ctx.clearRect(0,0,150,60);      
      _metaBalls.balls.forEach( function(b){
        __ctx.beginPath();
        __ctx.fillStyle = b.gradient;
        __ctx.arc(b.position.x, b.position.y, b.size, 0, Math.PI*2);
        __ctx.translate(b.position.x, b.position.y);
        __ctx.fill();   
        __ctx.translate(-b.position.x, -b.position.y);
      })

      var __imageData = __ctx.getImageData(0,0,150,60);
      var __data = __imageData.data;
      for (var i = 0, n = __data.length; i < n; i += 4) {
        if(__data[i+3] > 90 && __data[i+3]<120){
          __data[i+3] = 0;
        }else{
          __data[i]   = ~~(Math.sin(_time) * 127 + 128);
          __data[i+1] = ~~(Math.sin(_time+2) * 127 + 128);
          __data[i+2] = ~~(Math.sin(_time+5) * 127 + 128);         
        }
      }
      __ctx.putImageData(__imageData, 0, 0); 
    }
  }

  return  _that; 
}();