/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />

// ==============================================================
//
// PuZZGame.StateControllers.MenuController
//
// ==============================================================
PuZZGame.StateControllers.MenuController = function(){

  var _Vector2D = Pol.Core.Math.Vector2;

  var _states = Pol.Core.StateManager();
  var _buttons  = [];
  var _menuInfo = { left : 0, tempLeft : 0 }; 
  var _buttonsTileSet;
  var _fadeControler;    
  var _InputManager;
  var _ClapSoundPool;

  var _that       = { Update      : function(dt) { _states.state.update(dt); },
                      Draw        : function(ctx){ _states.state.draw(ctx); },
                      Deactivate  : function()  {},
                      Activate    : function(o) { 
                        if(!_InputManager){ 
                          _InputManager = Pol.Core.Game.InputManager;
                          var __Padding = 20;
                          var __H = Pol.Core.Game.GameHeight * .68;
                          var __W = Pol.Core.Game.GameWidth  * .25;                          
                          var __DIS = __W + __Padding;
                          var __Y = Pol.Core.Game.GameHeight * .5 - __H * .5 ;
                          var __X = __Padding;
                          var __onButtonClick = function() {
                            _ClapSoundPool.get(.5); 
                            _states.setState('leave', this);
                          };
                          var __a = Math.PI/8;                          
                          _buttons.add( Pol.apply( new Pol.Core.Math.Rect(__X, __Y, __W, __H),          { id : 'BTN_PUZZLE'  , imageIndex : 0, fase : 0, onclick : __onButtonClick }));
                          _buttons.add( Pol.apply( new Pol.Core.Math.Rect(__X += __DIS, __Y, __W, __H), { id : 'BTN_BALLONS' , imageIndex : 4, fase : __a, onclick : __onButtonClick }));
                          _buttons.add( Pol.apply( new Pol.Core.Math.Rect(__X += __DIS, __Y, __W, __H), { id : 'BTN_SHAPES'  , imageIndex : 1, fase : 2*__a, onclick : __onButtonClick }));
                          _buttons.add( Pol.apply( new Pol.Core.Math.Rect(__X += __DIS, __Y, __W, __H), { id : 'BTN_LETTERS' , imageIndex : 3, fase : 3*__a, onclick : __onButtonClick }));
                          _buttons.add( Pol.apply( new Pol.Core.Math.Rect(__X += __DIS, __Y, __W, __H), { id : 'BTN_NUMBERS' , imageIndex : 2, fase : 4*__a, onclick : __onButtonClick }));
                          _buttons.add( Pol.apply( new Pol.Core.Math.Rect(__X += __DIS, __Y, __W, __H), { id : 'BTN_SCORE'   , imageIndex : 5, fase : 5*__a, onclick : __onButtonClick }));
                          _buttons.add( Pol.apply( new Pol.Core.Math.Rect(__X += __DIS, __Y, __W, __H), { id : 'BTN_CREDITS' , imageIndex : 6, fase : 6*__a, onclick : __onButtonClick }));
                          _menuInfo.minLeft = Pol.Core.Game.GameWidth/2 - (__X - __DIS) - __Padding * 2 ;
                          _buttonsTileSet = new Pol.Core.TileSet({ assetName  : 'Menu.Images', tileWidth  : 128, tileHeight : 100 });
                          _ClapSoundPool = Pol.Core.Game.SoundManager.CreateSoundPool(3, 'CLAP.Sound').init();
                        } 
                        
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
                                        switch(o.id){
                                          case 'BTN_PUZZLE':
                                            Pol.Core.Game.StateManager.SetState('Game');
                                            break;
                                          case 'BTN_BALLONS':
                                            Pol.Core.Game.StateManager.SetState('Ballons');
                                            break;
                                          case 'BTN_SHAPES':
                                            Pol.Core.Game.StateManager.SetState('Shapes');
                                            break;
                                          case 'BTN_LETTERS':
                                            Pol.Core.Game.StateManager.SetState('Letters');
                                            break;
                                          case 'BTN_NUMBERS':
                                            Pol.Core.Game.StateManager.SetState('Numbers');
                                            break;
                                          case 'BTN_SCORE':
                                            Pol.Core.Game.StateManager.SetState('Score');
                                            break;
                                          case 'BTN_CREDITS':
                                            Pol.Core.Game.StateManager.SetState('Credits');
                                            break;
                                          default:
                                            _states.enter.activate();
                                        }                                                                                         
                                      });   
  };
  _states.leave.update = function(dt) { _fadeControler.update(dt); };
  _states.leave.draw   = function(ctx){
    ctx.globalAlpha = _fadeControler.value/100;
    __drawMenu(ctx);             
    ctx.globalAlpha = 1;    
  }; 

  // =============================================================================================================================================
  // 
  //  Idle
  // 
  // =============================================================================================================================================
  _states.idle.activate = function(){  
    document.body.style.backgroundImage = 'url({0})'.format(PuZZGame.Backgrounds.ImageUrl(1));
  };
  
  var _time = 0;
  var _pressedButton;
  _states.idle.update = function(dt){   
    _time += dt;   
    var __IData = _InputManager.Data;      
    if(__IData.EndTap && __IData.doEndTap){ 
      _pressedButton = undefined; 
      var __button = Pol.Core.Game.Collision.FindButtonAt(_buttons, { x : __IData.x - _menuInfo.left, y : __IData.y });
      if(__button) return __button.onclick();            
    } 

    if(__IData.Tap){
      __IData.doEndTap = true;        
      _menuInfo.tempLeft = _menuInfo.left;
      _pressedButton = Pol.Core.Game.Collision.FindButtonAt(_buttons, { x : __IData.x - _menuInfo.left, y : __IData.y });  
    }

    if(__IData.Move){      
      if(__IData.Delta.x || __IData.Delta.y){
        __IData.doEndTap = false; 
        _pressedButton = undefined;
      }     
      _menuInfo.left = Pol.Core.Math.Clamp( _menuInfo.tempLeft - (__IData.Delta.x * 1.3), _menuInfo.minLeft, 0);
    }


  };
  _states.idle.draw = function(ctx){
    __drawMenu(ctx);             
  };  
  
 
  
  // ==================================================================
  //  Common Draw stuff
  // ==================================================================
  function __draw(ctx){
     
  }

  function __drawMenu(ctx){
    __draw_option(ctx, new Pol.Core.Math.Rect(10, 10, Pol.Core.Game.GameWidth-20, 70));
    ctx.translate(_menuInfo.left, 0);
    _buttons.forEach( function(b){
      var __t = Math.sin(_time + b.fase) * 7 - 4;
      ctx.translate(0,__t);
      __draw_option(ctx, b);
      ctx.translate(0,-__t);
    });
    ctx.translate(-_menuInfo.left, 0);  
  }

  function __draw_option(ctx, r, border){        
    ctx.lineWidth   = border||1;
    ctx.strokeStyle = 'rgba(175,175,175,1)';
    Pol.Core.Drawing.SetShadow(10, 10, 25, 'rgba(0, 0, 0, 0.7)'); 
    if(_pressedButton==r){
      ctx.translate(r.left - r.width/2, 5+r.top - r.height/2);
      ctx.rotate(.015);
      ctx.fillStyle =  'rgba(125,0,0,1)';
      ctx.fillRect(r.width/2, r.height/2, r.width, r.height);
      Pol.Core.Drawing.ClearShadow();
      _buttonsTileSet.draw(ctx, r.imageIndex, { x : r.width/2, y : r.height/2+r.top}, 2.5 );                   
      if(border) ctx.strokeRect(8, 8, r.width-16, r.height-16);
      ctx.rotate(-.015)
      ctx.translate(-(r.left - r.width/2), -(5+r.top - r.height/2));
    }else{
      ctx.fillStyle = 'rgba(25,25,25,1)';
      ctx.fillRect(r.left, r.top, r.width, r.height);
      Pol.Core.Drawing.ClearShadow();
      _buttonsTileSet.draw(ctx, r.imageIndex, { x : r.left, y : r.top + r.height/2 - 150}, 2.5 );                   
      if(border) ctx.strokeRect(r.left+8, r.top+8, r.width-16, r.height-16);
    }
  }


  return  _that; 
}();