/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />

// ==============================================================
//
// PuZZGame.StateControllers.BallonsController
//
// ==============================================================
PuZZGame.StateControllers.BallonsController = function(){

  var _states = Pol.Core.StateManager();  
  var _fadeControler;    
  var _InputManager;
  var _ClapSoundPool;
  var _ParticleEmitter;
  var _btnHome, _btnMusic, _btnNex;
  var _buttons;
  var _buttonsTileSet, _ballonsTileSet;
  var _colorNames = Pol.serie(['white', 'red', 'yellow', 'blue', 'green', 'orange', 'pink', 'brown'])
  
  var _targets  = [];
  var _ballons  = [];
  var _dragBallon;
  var _LINE_WIDTH = 5, _FONT_SIZE = 300, _TOTAL_COUNT = 8;

  var _that       = { Update      : function(dt) { _states.state.update(dt); },
                      Draw        : function(ctx){ _states.state.draw(ctx); },
                      Deactivate  : function()  {},
                      Activate    : function(o) { 
                        if(!_InputManager){ 
                          _InputManager = Pol.Core.Game.InputManager; 

                          _btnMusic  = Pol.Core.Game.Collision.CreateCircle(50, 45, 30, { imageIndex : 7 })
                          _btnHome   = Pol.Core.Game.Collision.CreateCircle(Pol.Core.Game.GameWidth-50, 45, 30, { imageIndex : 0 })
                          _btnNext   = Pol.Core.Game.Collision.CreateCircle(Pol.Core.Game.GameWidth-50-70, 45, 30, { imageIndex : 2 })
                          _buttons   = [ _btnHome, _btnMusic, _btnNext ];
                          _btnMusic.onclick = function(){ __onButtonClick(_btnMusic); };
                          _btnHome.onclick  = function(){ __onButtonClick(_btnHome); };
                          _btnNext.onclick  = function(){ __onButtonClick(_btnNext); };
                          _buttonsTileSet = new Pol.Core.TileSet({ assetName  : 'Puzz.Buttons', tileWidth  : 50, tileHeight : 50 });
                          _ballonsTileSet = new Pol.Core.TileSet({ assetName  : 'Ballons.Color', tileWidth  : 52, tileHeight : 70 });
                          _ClapSoundPool = Pol.Core.Game.SoundManager.CreateSoundPool(3, 'CLAP.Sound').init();
                          _ParticleEmitter = PuZZGame.ParticleSystem(100);                                                   
                          
                          var __x1 = Pol.Core.Game.GameWidth-230; 
                          var __x2 = Pol.Core.Game.GameWidth-90;
                          var __y  = 160;                         
                          _targets.add( Pol.Core.Game.Collision.CreateCircle(__x1, __y, 73, { color : _colorNames.values[0]} ) );
                          _targets.add( Pol.Core.Game.Collision.CreateCircle(__x2, __y += 77, 73, { color : _colorNames.next()}) );
                          _targets.add( Pol.Core.Game.Collision.CreateCircle(__x1, __y += 77, 73, { color : _colorNames.next()}) );
                          _targets.add( Pol.Core.Game.Collision.CreateCircle(__x2, __y += 77, 73, { color : _colorNames.next()}) );
                          _targets.add( Pol.Core.Game.Collision.CreateCircle(__x1, __y += 77, 73, { color : _colorNames.next()}) );
                          _targets.add( Pol.Core.Game.Collision.CreateCircle(__x2, __y += 77, 73, { color : _colorNames.next()}) );
                          _targets.add( Pol.Core.Game.Collision.CreateCircle(__x1, __y += 77, 73, { color : _colorNames.next()}) );
                          _targets.add( Pol.Core.Game.Collision.CreateCircle(__x2, __y += 77, 73, { color : _colorNames.next()}) );                         
                        }
                        __initBallons(_TOTAL_COUNT);                         
                        _states.setState('enter');
                      }};
                          
  // =============================================================================================================================================
  // 
  //  Enter
  // 
  // =============================================================================================================================================
  _states.enter.activate = function(){
    _fadeControler = new Pol.Core.Game.FadeControler(500)
                                      .fadeUp( function(){ 
                                        _states.setState('idle');
                                       });    
  };
  _states.enter.update = function(dt) { _fadeControler.update(dt);};
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
                                        Pol.Core.Game.EventManager.removeEvent('onSuccess');                                                                               
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
    document.body.style.backgroundImage = 'url({0})'.format(PuZZGame.Backgrounds.ImageUrl(7));
  };

  _states.idle.update = function(dt){ 
    
    __updateBallons(dt);
       
    var __IData = _InputManager.Data;
    if(__IData.Tap){ 
      // ==================================================================================
      // Find button
      // ==================================================================================
      var __button = Pol.Core.Game.Collision.FindButtonAt(_buttons, __IData);
      if(__button) return __button.onclick();
      // ==================================================================================
      // Find target
      // ==================================================================================     
      _dragBallon = _ballons.where( function(t){ return !t.isInPlace && t.center.contains(__IData); })[0];
      if(_dragBallon){        
        _dragBallon._position = { x : _dragBallon.center.x, y : _dragBallon.center.y };        
      }    
    }      
        
    if(__IData.EndTap && _dragBallon){
      var __target = Pol.Core.Game.Collision.FindButtonAt(_targets, _dragBallon.center);
      if(__target && __target.color == _dragBallon.color){
        __onSuccess(_dragBallon, __target);               
      }else{
        _dragBallon.goingHome = true;
        _dragBallon._velocity = _dragBallon.velocity.clone();
        _dragBallon.velocity = Pol.Core.Math.Vector2.difference( _dragBallon._position, _dragBallon.center )
                                                    .mul(2);         
      } 
      _dragBallon = undefined;          
    } 

    if(__IData.Move && _dragBallon )  {       
      _dragBallon.center.x = _dragBallon._position.x - __IData.Delta.x;
      _dragBallon.center.y = _dragBallon._position.y - __IData.Delta.y;                 
    }

  };
  _states.idle.draw = function(ctx){
    __draw(ctx);             
  };  
  
  // ==================================================================
  //  Buttons handlers
  // ==================================================================
  function __onButtonClick (sender){
    if(sender===_btnHome){
      _states.setState('leave');
    }else if(sender===_btnMusic){
      Pol.Core.Game.SoundManager.toggleSoundState();
    }else if(sender===_btnNext){
      Pol.Core.Game.EventManager.removeEvent('onSuccess');
      __initBallons(_TOTAL_COUNT);
    }
    _ClapSoundPool.get(.5);    
  }  
  
  // ==================================================================
  //  Ballons
  // ==================================================================
  function __initBallons(numbers){
    var __positions = Pol.serie( [70, 150, 260, 300, 400, 600] );
    _ballons = [];
    var __last = Pol.Core.Game.GameHeight;
    for(var i=0;i<numbers;i++){      
      var __ballon = { color      : _colorNames.nextRandom(),
                       scale      : 2,
                       center     : Pol.Core.Game.Collision.CreateCircle(__positions.next(),__last, 35 * 2), 
                       velocity   : new Pol.Core.Math.Vector2(0, Pol.Core.Math.Random(-80,-160)),
                       imageIndex : _colorNames.current,
                       seed       : Math.random()*13.14,
                       period     : Math.random()*3
                     }                
      _ballons.add(__ballon);
      __last += 300
    }
  }
  var _time = 0.0; 
  function __updateBallons(dt){
    _time += dt;
    _ballons.forEach( function(ballon){

      if(_dragBallon==ballon || ballon.isInPlace) return; 
      if(ballon.goingHome == true){
        if(Pol.Core.Math.Vector2.distance( ballon._position, ballon.center )<100){
          ballon.center.x = ballon._position.x;
          ballon.center.y = ballon._position.y;
          ballon.velocity = ballon._velocity; 
          ballon.goingHome = false;
        }
      }    
      ballon.center.x += ballon.velocity.x * dt;
      ballon.center.y += ballon.velocity.y * dt; 
      ballon.angle = Math.sin(_time+ballon.seed) * 0.2 * ballon.period;              
      if(ballon.center.y<-80){
        ballon.center.y = Pol.Core.Game.GameHeight + 300;  
      }
    })
    _ParticleEmitter.update(dt);
  }

  function __onSuccess(target, destination){
    _ClapSoundPool.get(.5);
    Pol.Core.Game.SoundManager.playSound("Sonic.Sound")
    Pol.Core.Game.EventManager.removeEvent('onSuccess');
    
    target.velocity.y = 0;
    target.scale = 0.8;
    target.center.x = destination.x;
    target.center.y = destination.y;
    target.isInPlace = true;
    
    _ParticleEmitter.createParticlesAt(destination, 25);

    var __last = _ballons.every( function(t){ return t.isInPlace==true; });
    if(__last){
      
      Pol.Core.Game.SoundManager.playSound("SUCCESS.Sound");
      var __e = Pol.Core.Game.EventManager.buildEvent( function(){          
        __initBallons(_TOTAL_COUNT)                             
      }, 2500, 1); // callback, delay, times, onTerminate;               
      Pol.Core.Game.EventManager.addEvent(__e, 'onSuccess');
    }
    
  }
  
  // ==================================================================
  //  Common Draw stuff
  // ==================================================================
  function __draw(ctx){
    __drawTarget(ctx);    
    __draw_option(ctx, new Pol.Core.Math.Rect(10, 10, Pol.Core.Game.GameWidth-20, 70));
    __draw_buttons(ctx);     
  }
  
  function __draw_buttons(ctx){
    _buttons.forEach( function(b){           
      _buttonsTileSet.draw(ctx, b.imageIndex, { x : b.x - b.radius, y : b.y - b.radius }, 1.2 );      
    }); 
  }

  function __draw_option(ctx, r, border){        
    ctx.lineWidth   = border||1;
    ctx.strokeStyle = 'rgba(175,175,175,1)';
    Pol.Core.Drawing.SetShadow(10, 10, 25, 'rgba(0, 0, 0, 0.7)'); 
    ctx.fillStyle = 'rgba(25,25,25,1)';
    ctx.fillRect(r.left, r.top, r.width, r.height);
    Pol.Core.Drawing.ClearShadow();                      
    if(border) ctx.strokeRect(r.left+8, r.top+8, r.width-16, r.height-16);
  }

  function __drawTarget(ctx){
    _targets.forEach( function(target){
      Pol.Core.Drawing.DrawCircle(target, 5, 'white', target.color);                 
    }); 
    _ballons.forEach( function(ballon){
      if(ballon.isInPlace) return;      
      var __Half_W = _ballonsTileSet.tileWidth * .5 * ballon.scale;
      var __Half_H = _ballonsTileSet.tileHeight * .5 * ballon.scale;
      ctx.translate(ballon.center.x - __Half_W, ballon.center.y - __Half_H);
      ctx.rotate(ballon.angle);
      _ballonsTileSet.draw(ctx, ballon.imageIndex, Pol.Core.Math.Vector2_ZERO, ballon.scale);
      ctx.rotate(-ballon.angle);
      ctx.translate(- (ballon.center.x - __Half_W), -(ballon.center.y - __Half_H));        
      
    })
    _ParticleEmitter.draw(ctx);
  }

  return  _that; 
}();