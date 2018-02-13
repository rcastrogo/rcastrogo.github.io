/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />

// ==================================================================================================== 
//
// UML.StateControllers.SplashScreenController
//
// ====================================================================================================
Pol.createNamespace('UML.StateControllers', this);
UML.StateControllers.SplashScreenController = function(){

  var _that       = { Update : function(dt) { _states.state.update(dt); },
                      Draw   : function(ctx){ _states.state.draw(ctx); },
                      Deactivate : function()  {},
                      Activate   : function(o) { _states.setState('enter'); }
                    };
  var _eventsIds  = {};  
  var _states     = Pol.Core.StateManager();
  var _fadeControler; 
  var _tileSet;      
  
  // =============================================================================================================================================
  // 
  //  Enter
  // 
  // =============================================================================================================================================
  _states.enter.activate = function(){ 

    Pol.Core.Resources.AddAsset('SplashScreen'   , 'img/Uml.png'); 

  };

  _states.enter.update = function(dt) {
    if(Pol.Core.Resources.Ready()) {
      _tileSet       = new Pol.Core.TileSet({ assetName : 'SplashScreen' });
      _fadeControler = new Pol.Core.Game.FadeControler(300).fadeUp();  
      _states.setState('idle');
    } 
  };
  _states.enter.draw = function(ctx){
    if(Pol.Core.Resources.Completion()<=1){
      ctx.beginPath();
      ctx.strokeStyle = "gray";
      ctx.lineWidth=27;   
      ctx.arc(Pol.Core.Game.screenCenter.x, Pol.Core.Game.screenCenter.y, 50, 0, (Math.PI * 2) * (Pol.Core.Resources.Completion()) , false);
      ctx.stroke() 
    }
  };  

  // =============================================================================================================================================
  // 
  //  Idle
  // 
  // =============================================================================================================================================
  _states.idle.activate = function(){
    // callback, delay, times
    var __e = Pol.Core.Game.EventManager.buildEvent( function(){ _states.setState('leave'); }, 800, 1);
    Pol.Core.Game.EventManager.addEvent(__e, 'close');
  };
  _states.idle.update = function(dt){
    _fadeControler.update(dt);
    if(Pol.Core.Game.InputManager.Data.Tap){
      Pol.Core.Game.EventManager.removeEvent('close');          
      _states.setState('leave')                     
    } 
  };
  _states.idle.draw = function(ctx){
    __draw(ctx);       
  };  
  
  // =============================================================================================================================================
  // 
  //  Leave
  // 
  // =============================================================================================================================================
  _states.leave.activate = function(){
    //Pol.Core.Game.SoundManager.loopSound("Puzz.Music");
    _fadeControler = new Pol.Core.Game.FadeControler(1000).fadeDown( function(){ Pol.Core.Game.StateManager.SetState(Pol.Core.Game.controller || 'Main'); });
  };
  _states.leave.update = function(dt) { _fadeControler.update(dt); };
  _states.leave.draw = function(ctx){
    ctx.globalAlpha = _fadeControler.value/100;
    __draw(ctx);             
    ctx.globalAlpha = 1;    
  };  
  
  function __draw(ctx){
    ctx.save();
    ctx.translate(Pol.Core.Game.screenCenter.x, Pol.Core.Game.screenCenter.y ); 
    ctx.scale(_fadeControler.value/100, _fadeControler.value/100);
   
    var rec    = _tileSet.tileRectangle(0);
    var center = _tileSet.centerPointOf(0);  
    _tileSet.texture.Draw(ctx, rec.left, rec.top, rec.width, rec.height, -center.x, -center.y, rec.width, rec.height); //function(ctx,sx, sy, sw, sh, dx, dy, dw, dh)
    ctx.restore()
  }

  return  _that; 
}();
