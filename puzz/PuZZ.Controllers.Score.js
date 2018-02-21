/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />

// ==============================================================
//
// PuZZGame.StateControllers.ScoreController
//
// ==============================================================
PuZZGame.StateControllers.ScoreController = function(){

  var _states = Pol.Core.StateManager(); 
  var _time = 0;  
  var _fadeControler;    
  var _InputManager;
  var _ClapSoundPool;
  var _btnHome, _btnMusic;
  var _buttons;
  var _buttonsTileSet, _iconsTileSet;
  var _panels = [];
  var _panelInfo  = { left : 0, tempLeft : 0 };
  var _colorNames = Pol.serie(['red', 'blue', 'green'])
  var _score = -1;

  var _that       = { Update      : function(dt) { _time+= dt; _states.state.update(dt); },
                      Draw        : function(ctx){ _states.state.draw(ctx); },
                      Deactivate  : function()  {},
                      Activate    : function(o) { 
                        if(!_InputManager){ 
                          _InputManager = Pol.Core.Game.InputManager; 

                          _btnMusic  = Pol.Core.Game.Collision.CreateCircle(50, 45, 30, { imageIndex : 7 });
                          _btnHome   = Pol.Core.Game.Collision.CreateCircle(Pol.Core.Game.GameWidth-50, 45, 30, { imageIndex : 0 });                                                  
                          _buttons   = [ _btnHome, _btnMusic ];
                          _btnMusic.onclick = function(){ __onButtonClick(_btnMusic); };
                          _btnHome.onclick  = function(){ __onButtonClick(_btnHome); };
                          
                          var __Padding = 80;
                          var __H = Pol.Core.Game.GameHeight * .7;
                          var __W = Pol.Core.Game.GameWidth  * .51;                          
                          var __DIS = __W + __Padding;
                          var __Y = Pol.Core.Game.GameHeight * .2  ;
                          var __X = __Padding*2;
                          var __a = Math.PI/2;                          
                          _panels.add( Pol.apply( new Pol.Core.Math.Rect(__X, __Y, __W, __H),          { id : 0, color : 'red'  , fill : 'rgba(200,0,0,.5)', fase : 0 }));
                          _panels.add( Pol.apply( new Pol.Core.Math.Rect(__X += __DIS, __Y, __W, __H), { id : 1, color : 'blue' , fill : 'rgba(0,0,200,.5)', fase : __a }));
                          _panels.add( Pol.apply( new Pol.Core.Math.Rect(__X += __DIS, __Y, __W, __H), { id : 2, color : 'green', fill : 'rgba(0,200,0,.5)', fase : __a*2 }));
                          _panelInfo.minLeft = -(__X-Pol.Core.Game.GameWidth/2 + __Padding*2)

                          _buttonsTileSet = new Pol.Core.TileSet({ assetName  : 'Puzz.Buttons', tileWidth  : 50, tileHeight : 50 });
                          _iconsTileSet = new Pol.Core.TileSet({ assetName  : 'Score.Icons', tileWidth  : 48, tileHeight : 48, width : 480, height : 480 });
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
                                      .fadeUp( function(){ 
                                        _states.setState('idle');
                                       });
    _score = Pol.Core.Game.Configuration.getValue('score');
    __createPanelImages(Pol.Core.Game.context);                                           
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
    document.body.style.backgroundImage = 'url({0})'.format(PuZZGame.Backgrounds.ImageUrl(5));    
  };

 
  _states.idle.update = function(dt){ 
   
    var __Data = _InputManager.Data;      
    if(__Data.EndTap){ 
      // =====================================================================
      // Find button
      // =====================================================================
      var __button = Pol.Core.Game.Collision.FindButtonAt(_buttons, __Data);
      if(__button) return __button.onclick();           
    } 

    if(__Data.Tap){      
      _panelInfo.tempLeft = _panelInfo.left;      
    }

    if(__Data.Move){         
      _panelInfo.left = Pol.Core.Math.Clamp( _panelInfo.tempLeft - (__Data.Delta.x * 1.3), _panelInfo.minLeft, 0);
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
    } 
    _ClapSoundPool.get(.5);   
  }
  
   
  // ====================================================================================
  //  Common Draw stuff
  // ====================================================================================
  function __draw(ctx){
    __drawPanels(ctx);    
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

  function __drawPanels(ctx){
    _panels.forEach( function(p){
      var __t = Math.sin(_time + p.fase) * 7 - 4;
      ctx.translate(_panelInfo.left,__t);
      __drawPanel(ctx, p);
      ctx.translate(-_panelInfo.left,-__t);
    }); 
  }

  var __All = { upperLeft : 20, upperRight : 20, lowerLeft : 20, lowerRight : 20 };
  function __drawPanel(ctx, p){  
    ctx.fillStyle   = p.fill;
    ctx.lineWidth   = 4;
    ctx.strokeStyle = 'rgba(175,175,175,.5)';      
    Pol.Core.Drawing.SetShadow(10, 10, 25, 'rgba(0, 0, 0, 0.7)');          
    Pol.Core.Drawing.roundRect( p.left, p.top, p.width, p.height, __All, true, true );
    Pol.Core.Drawing.ClearShadow();
    ctx.translate(p.left + 15,p.top + 15);
    ctx.drawImage(__offScreenPanels[p.id], 0, 0);
    ctx.translate(-(p.left + 15), -(p.top + 15));                 
  }

  var __offScreenPanels = [0,0,0];
  function __createPanelImages(ctx){
    var __i = 0;
    for(var x=0;x<3;x++){    
      __offScreenPanels[x] = Pol.Core.Drawing.createBuffer(624, 534, function(ctx){
        
        ctx.translate(-40,0);
        ctx.rotate(-.5);
        var __y = 0;
        for(var x=0; x<12; x++){
          ctx.fillStyle = 'rgba(250,250,250,.1)';
          ctx.fillRect(x*-40, __y, 624 + x*40, 55);
          __y += 68;
        }
        ctx.rotate(.5);
        ctx.translate(40,0);

        for(var row=0; row<6; row++){
          for(var col=0; col<7; col++,__i++){
            if(__i>_score)
              _buttonsTileSet.draw(ctx, 6, { x : col*90, y : row*90}, 1.5 );             
            else       
              _iconsTileSet.draw(ctx, __i, { x : col*90, y : row*90}, 1.5 );               
          }      
        }
      })
    }
  }


  return  _that; 

}();