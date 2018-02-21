/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />

// ==============================================================
//
// PuZZGame.StateControllers.NumbersController
//
// ==============================================================
PuZZGame.StateControllers.NumbersController = function(){

  var _states = Pol.Core.StateManager();  
  var _fadeControler;    
  var _InputManager;
  var _ClapSoundPool;
  var _ParticleEmitter;
  var _btnHome, _btnMusic, _btnNext;
  var _buttons;
  var _buttonsTileSet;
  var _colorNames = Pol.serie(['red', 'blue', 'pink', 'green', 'yellow', 'brown', 'black', 'white', 'orange', 'gray'])

  var _LINE_WIDTH = 5, _FONT_SIZE = 300, _TOTAL_COUNT = 3;

  var _that       = { Update      : function(dt) { _states.state.update(dt); },
                      Draw        : function(ctx){ _states.state.draw(ctx); },
                      Deactivate  : function()  {},
                      Activate    : function(o) { 
                        if(!_InputManager){ 
                          _InputManager = Pol.Core.Game.InputManager; 

                          _btnMusic  = Pol.Core.Game.Collision.CreateCircle(50, 45, 30, { imageIndex : 7 });
                          _btnHome   = Pol.Core.Game.Collision.CreateCircle(Pol.Core.Game.GameWidth-50, 45, 30, { imageIndex : 0 });                                                    
                          _btnNext   = Pol.Core.Game.Collision.CreateCircle(Pol.Core.Game.GameWidth-50-70, 45, 30, { imageIndex : 2 });
                          _buttons   = [ _btnHome, _btnMusic, _btnNext ];
                          _btnMusic.onclick = function(){ __onButtonClick(_btnMusic); };
                          _btnHome.onclick  = function(){ __onButtonClick(_btnHome); };
                          _btnNext.onclick  = function(){ __onButtonClick(_btnNext); };
                          _buttonsTileSet = new Pol.Core.TileSet({ assetName  : 'Puzz.Buttons', tileWidth  : 50, tileHeight : 50 });
                          _ClapSoundPool = Pol.Core.Game.SoundManager.CreateSoundPool(3, 'CLAP.Sound').init();                                                   
                          _ParticleEmitter = PuZZGame.ParticleSystem(100);
                        } 
                        __initNumbers(_TOTAL_COUNT);                                               
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
  _states.enter.update = function(dt) {  _fadeControler.update(dt);  };
  _states.enter.draw   = function(ctx){
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
  _states.leave.update = function(dt) { 
    _fadeControler.update(dt); 
    _ParticleEmitter.update(dt);
    __updateNumbers(dt);
  };
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
    
    __updateNumbers(dt);
    _ParticleEmitter.update(dt); 
           
    var __IData = _InputManager.Data;
    if(__IData.Tap){ 
      _dragItem = undefined;
      // ==================================================================================
      // Find button
      // ==================================================================================
      var __button = Pol.Core.Game.Collision.FindButtonAt(_buttons, __IData);
      if(__button) return __button.onclick();
      // ==================================================================================
      // Find target
      // ==================================================================================     
      _dragItem = _targets.where( function(t){ return t.bounds.contains(__IData); })[0];
      if(_dragItem){        
        _dragItem._position = _dragItem.position.clone();        
      }   
    }      
        
    if(__IData.EndTap && _dragItem){
      if( _dragItem.checkPoint.contains(_dragItem.position)){
        __onSuccess(_dragItem);        
      }else{
        _dragItem.position = _dragItem._position.clone();
      }
      _dragItem = undefined;     
    } 

    if(__IData.Move && _dragItem )  {       
      _dragItem.position.x = _dragItem._position.x - __IData.Delta.x;
      _dragItem.position.y = _dragItem._position.y - __IData.Delta.y;            
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
      __initNumbers();
    }  
    _ClapSoundPool.get(.5);   
  } 

  // ==================================================================
  //  Numbers
  // ==================================================================
  var o_number = { number      : '0', 
                   destination : Pol.Core.Math.Vector2_ZERO.clone(), 
                   position    : Pol.Core.Math.Vector2_ZERO.clone(),
                   isInPlace   : false,
                   visible     : true 
                };
  var _targets;
  var _dragItem;
  var _locations = {
    positions    : [ new Pol.Core.Math.Vector2(906,412),
                     new Pol.Core.Math.Vector2(508,361),
                     new Pol.Core.Math.Vector2(46,320)
                   ],
    destinations : [ new Pol.Core.Math.Vector2(34,650),
                     new Pol.Core.Math.Vector2(889,776),
                     new Pol.Core.Math.Vector2(465,730)                                                                
                   ],
    values       : [ [1,2,3], [4,5,6], [7,8,9], [0,1,3], [5,7,9], [2,4,6], [1,6,9], [2,3,4], [3,4,5]]
  }
  function __initNumbers(numbers){

    _targets = _targets || [ o_number.Create(), o_number.Create(), o_number.Create() ];

    var __init = function(o){
      var __current = o.number;
      while(__current==o.number){
        o.number = Pol.Core.Math.Clamp( Pol.Core.Math.Random(11,-2), 0, 9).toString();    
      }
    }
    var __getBounds = function(text, size, target){
      var __ctx = Pol.Core.Game.Context;
      __ctx.save();
      __ctx.lineWidth = 5;
      __ctx.font      = size + 'px Moire ExtraBold';
      var __width = __ctx.measureText(text).width;
      __ctx.restore();
      return new Pol.Core.Math.Rect(target.position.x, target.position.y - size * .75, __width , size * .75);
    }
    var __values = _locations.values[Pol.Core.Math.Random(_locations.values.length-1,0)];
    _targets.forEach( function(t, i){
      t.number = __values[i];
      t.color = _colorNames.next();
      t.offset = 0;
      t.fase = Math.random();
      t.destination = _locations.positions[i].clone(); 
      t.position    = _locations.destinations[i].clone(); 
      t.bounds      = __getBounds(t.number, _FONT_SIZE, t);
      t.checkPoint  = Pol.Core.Game.Collision.CreateCircle(t.destination.x, t.destination.y, 50);
      t.isInPlace   = false;     
    })                                                                                                                                                                    
  } 

  var _time = 0;
  function __updateNumbers(dt){
    _time += dt*2;
    _targets.forEach( function(n){
      if(n.isInPlace){
        n.offset=0;
      }else{
        n.offset = Math.sin( _time + n.fase ) * 15 - 7;
      }
    });
  }

  function __onSuccess(target){
    _ParticleEmitter.createParticlesAt( { color : target.color, x : _InputManager.Data.x, y : _InputManager.Data.y }, 10);
    Pol.Core.Game.SoundManager.playSound("Sonic.Sound")
    Pol.Core.Game.EventManager.removeEvent('onSuccess');
    target.position  = target.destination.clone();
    target.isInPlace = true;
    var __last = _targets.every( function(t){ return t.isInPlace==true; });
    if(__last){
      Pol.Core.Game.SoundManager.playSound("SUCCESS.Sound");
    }  
    var __e = Pol.Core.Game.EventManager.buildEvent( function(){         
        target.visible = !target.visible;        
      }, 200, 12, function(){
        target.visible = true;
        if(__last){                              
          __initNumbers(_TOTAL_COUNT);
        }        
      }
    ); // callback, delay, times, onTerminate;         
    Pol.Core.Game.EventManager.addEvent(__e, 'onSuccess');
  }
    
  // ====================================================================================
  //  Common Draw stuff
  // ====================================================================================
  function __draw(ctx){
    if(_states.state!=_states.enter){
      __drawNumbers(ctx);
    }
    _ParticleEmitter.draw(ctx);     
    __drawTopBar(ctx, new Pol.Core.Math.Rect(10, 10, Pol.Core.Game.GameWidth-20, 70));
    __drawTopBarButtons(ctx);     
  }
  function __drawTopBarButtons(ctx){
    _buttons.forEach( function(b){           
      _buttonsTileSet.draw(ctx, b.imageIndex, { x : b.x - b.radius, y : b.y - b.radius }, 1.2 );      
    }); 
  }

  function __drawTopBar(ctx, r, border){        
    ctx.lineWidth   = border||1;
    ctx.strokeStyle = 'rgba(175,175,175,1)';
    Pol.Core.Drawing.SetShadow(10, 10, 25, 'rgba(0, 0, 0, 0.7)'); 
    ctx.fillStyle = 'rgba(25,25,25,1)';
    ctx.fillRect(r.left, r.top, r.width, r.height);
    Pol.Core.Drawing.ClearShadow();                      
    if(border) ctx.strokeRect(r.left+8, r.top+8, r.width-16, r.height-16);
  }

  function __drawNumbers(ctx){ 
    var __numbers = _targets.map( function(n){return n;} ).reverse();

    var __drawNumber = function(n, p){
      Pol.Core.Drawing.SetShadow(5, 5, 25, 'rgba(0, 0, 0, 0.7)');
      ctx.fillText(n.number, p.x, p.y);
      Pol.Core.Drawing.ClearShadow();
      ctx.strokeText(n.number, p.x, p.y); 
    }

    ctx.lineWidth   = _LINE_WIDTH;
    ctx.font        = _FONT_SIZE +'px Moire ExtraBold';
    ctx.strokeStyle = 'black';       
    ctx.setLineDash([12]); 
    ctx.fillStyle = 'rgba(5,5,5,.3)';
    __numbers.forEach( function(n){
      if(!n.isInPlace){
        __drawNumber(n, n.destination); 
      }
    });
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(205,205,205,1)';  
    __numbers.forEach( function(n){
      if(n.visible && n!=_dragItem){ 
        ctx.fillStyle = n.color;
        ctx.translate(0, n.offset)
        __drawNumber(n, n.position);
        ctx.translate(0, -n.offset)
      }
    }); 
    if(_dragItem && _dragItem.visible){
      ctx.fillStyle = _dragItem.color;
      __drawNumber(_dragItem, _dragItem.position);
    }         
  }

  return  _that; 
}();