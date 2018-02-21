/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />

// ==============================================================
//
// PuZZGame.Dialogs.AnimalPicker
//
// ==============================================================
PuZZGame.Dialogs.AnimalPicker = function(){
  
  var _time = 0;
  var _states = Pol.Core.StateManager();  
  var _fadeControler;    
  var _InputManager;
  var _btnContinue, _btnHome;
  var _buttons, _buttonsA;
  var _buttonsTileSet, _iconsTileSet;
  var _ClapSoundPool;
  var _onCloseDialog;
  var _closed = false;
  var _score, _selected;

  var _that = { Update      : function(dt) { _time += dt; _states.state.update(dt); },
                Draw        : function(ctx){ _states.state.draw(ctx); },
                Deactivate  : function()  {},
                Activate    : function(o, callback) { 
                  if(!_InputManager){ 
                    _InputManager = Pol.Core.Game.InputManager;

                    var __Top = Pol.Core.Game.screenCenter.y + 160; 
                    _btnContinue = Pol.Core.Game.Collision.CreateCircle(Pol.Core.Game.screenCenter.x+300, __Top, 30, { imageIndex : 1 });
                    _btnHome     = Pol.Core.Game.Collision.CreateCircle(Pol.Core.Game.screenCenter.x-300, __Top, 30, { imageIndex : 0 });
                    _buttons     = [ _btnContinue, _btnHome];
                    _btnContinue.onclick = function(){ __onButtonClick(_btnContinue);  };
                    _btnHome.onclick     = function(){ __onButtonClick(_btnHome); };
                    
                    var __X = 336;
                    _buttonsA    = [ Pol.Core.Game.Collision.CreateCircle(__X, 298, 50, { id : 0 } ),
                                     Pol.Core.Game.Collision.CreateCircle(__X+=120, 298, 50, { id : 1 }),
                                     Pol.Core.Game.Collision.CreateCircle(__X+=120, 298, 50, { id : 2 }),
                                     Pol.Core.Game.Collision.CreateCircle(__X+=120, 298, 50, { id : 3 })
                                   ];

                    _buttonsTileSet = new Pol.Core.TileSet({ assetName  : 'Puzz.Buttons', tileWidth  : 50, tileHeight : 50 });
                    _iconsTileSet   = new Pol.Core.TileSet({ assetName  : 'Score.Icons', tileWidth  : 48, tileHeight : 48, width : 480, height : 480 });
                    _ClapSoundPool = Pol.Core.Game.SoundManager.CreateSoundPool(3, 'CLAP.Sound').init();                               
                  }                         
                  _states.setState('enter');
                  _closed = false;
                  _onCloseDialog = callback;
                  _buttonsA.forEach( function(b){ b.selected = false; } );
                  _selected = false;
                  _score = Pol.Core.Game.Configuration.getValue('score');
                }
              };
                          
  // =============================================================================================================================================
  // 
  //  Enter
  // 
  // =============================================================================================================================================
  _states.enter.activate = function()   { };
  _states.enter.update   = function(dt) { _states.setState('idle'); };
  _states.enter.draw     = function(ctx){ __draw(ctx); };  

  // =============================================================================================================================================
  // 
  //  Leave
  // 
  // ============================================================================================================================================= 
  _states.leave.activate  = function(o)  {
    if(!_closed){
      _closed = true; 
      _onCloseDialog();
    }   
  };
  _states.leave.update    = function(dt) {  };
  _states.leave.draw      = function(ctx){ __draw(ctx); }; 

  // =============================================================================================================================================
  // 
  //  Idle
  // 
  // =============================================================================================================================================
  _states.idle.activate = function(){      
    _time=0;
  };

  _states.idle.update = function(dt){
     
    if(_closed) return;
       
    var __Data = _InputManager.Data;      
    if(__Data.EndTap){ 
      // =====================================================================
      // Find button
      // =====================================================================
      var __button = Pol.Core.Game.Collision.FindButtonAt(_buttons, __Data);
      if(__button) return __button.onclick(); 
      __button = Pol.Core.Game.Collision.FindButtonAt(_buttonsA, __Data);
      if(__button) return __onButtonAClick(__button);          
    }      
        
    if(__Data.EndTap){ }; 
    if(__Data.Move)  { };

  };

  _states.idle.draw = function(ctx){
    __draw(ctx);             
  };  
  
  // ==================================================================
  //  Buttons handlers
  // ==================================================================
  function __onButtonClick (sender){
    if(sender===_btnContinue){
      _states.setState('leave');      
    }else if(sender===_btnHome){
      _states.setState('leave');
      Pol.Core.Game.StateManager.SetState('Menu');      
    }
    _ClapSoundPool.get(.5);    
  }
  function __onButtonAClick(sender){
    if(!_selected){
      Pol.Core.Game.Configuration.setValue('score', ++_score);   
      _selected = sender.selected = true;
      _ClapSoundPool.get(.5);
    }
  }
       
  // ==================================================================
  //  Common Draw stuff
  // ==================================================================
  var __All = { upperLeft : 20, upperRight : 20, lowerLeft : 20, lowerRight : 20 };
  function __draw(ctx){
    if(_closed) return; 
    var __w = 800;
    var __h = 400;
    var __top  = Pol.Core.Game.screenCenter.y - __h * .5;
    var __left = Pol.Core.Game.screenCenter.x - __w * .5
    ctx.translate(__left, __top);

    // =========================================================================
    // Main border
    // =========================================================================
    ctx.lineWidth   = 4;
    ctx.fillStyle = 'rgba(75,75,75,.8)'; 
    ctx.strokeStyle = 'rgba(175,175,175,.5)';
    Pol.Core.Drawing.SetShadow(10, 10, 25, 'rgba(0, 0, 0, 0.7)');         
    Pol.Core.Drawing.roundRect( 0, 0, __w, __h, __All, true, true );
    Pol.Core.Drawing.ClearShadow();
    
    // =========================================================================
    // Selectables
    // =========================================================================
    ctx.fillStyle = 'rgba(75,75,75,1)';
    Pol.Core.Drawing.roundRect( 30 , 30, 500, 130, __All, true, true );
    var __showSelectedIcon = false;
    _buttonsA.forEach( function(b, i){
      if(b.selected){
        __showSelectedIcon = true;
        _iconsTileSet.draw(ctx, _score, { x : i * 120 + 45, y : 50 }, 2 );
        return;
      }       
      _buttonsTileSet.draw(ctx, 6, { x : i * 120 + 45, y : 45}, 2 );
    });

    // =========================================================================
    // Recent
    // =========================================================================                  
    Pol.Core.Drawing.roundRect( 30 , 190, 500, 130, __All, true, true );
    for(var x=0; x<4; x++){
      var __index = _score-x;
      if(__index<0) break;       
      _iconsTileSet.draw(ctx, __index, { x : x * 120 + 45, y : 210}, 2 );               
    }
    // =========================================================================
    // Selected
    // ========================================================================= 
    Pol.Core.Drawing.roundRect( 560, 30, 210, 290, __All, true, true );
    if(__showSelectedIcon){
      _iconsTileSet.draw(ctx, _score, { x : 570, y : 80}, 4 );
    }
    
    ctx.translate(-__left, -__top);

    // =========================================================================
    // Dialog Buttons
    // =========================================================================
    __drawTopBarButtons(ctx);    
  }

  function __drawTopBarButtons(ctx){
    _buttons.forEach( function(b){           
      _buttonsTileSet.draw(ctx, b.imageIndex, { x : b.x - b.radius, y : b.y - b.radius }, 1.2 );      
    }); 
  }

  return  _that; 
}();