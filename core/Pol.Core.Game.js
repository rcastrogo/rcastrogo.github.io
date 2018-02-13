/// <reference path="Pol.Core.js" />

// ==================================================================================================== 
//
// Pol.Core.Game
//
// ====================================================================================================
Pol.Core.Game = function(){

  var _that = { Paused : true, refresh : __onResize ,                     
                Events : { OnResize  : new Pol.Core.Event('Pol.Core.Game.Resize'),
                           OnPause   : new Pol.Core.Event('Pol.Core.Game.Pause'),
                           OnResume  : new Pol.Core.Event('Pol.Core.Game.Resume') }
  };   
  var _renderLoopId,_updateLoopId;    
  var _renderLoop,_updateLoop;  
  
  function __getTimestamp(){ 
    return ( window.performance && window.performance.now )
           ? window.performance.now()
           : new Date().getTime(); 
  } 
 
  function __onResize(){
    var h = window.innerHeight - $('toolbar').clientHeight - $('footer').clientHeight;
    var scaleToFitX = window.innerWidth / _that.GameWidth;
    var scaleToFitY = h / _that.GameHeight;        
    _that.CanvasRatioX =  window.innerWidth / _that.GameWidth;
    _that.CanvasRatioY =  h / _that.GameHeight;
    with(_that.Canvas.style){
      //width      = _that.GameWidth  * _that.CanvasRatio + "px";
      //height     = _that.GameHeight * _that.CanvasRatio + "px";          
      //marginLeft =  ((window.innerWidth - (_that.GameWidth * _that.CanvasRatio))/2) + 'px';
      //marginTop  =  ((window.innerHeight - (_that.GameHeight * _that.CanvasRatio))/2) + 'px';     
      height = h - 8 + 'px';
      top = ($('toolbar').clientHeight + 4) + 'px';
    }

    _that.Events.OnResize.Dispatch({ Message : '{0}x{1}'.format(window.innerWidth,window.innerHeight), 
                                     Width   : window.innerWidth,
                                     Height  : window.innerHeight
                                   });    
  }

  function __onFocus(){
    _that.Play();
    Pol.Core.Game.SoundManager.Resume();
  }

  function __onLostFocus(){
    _that.Pause();
    Pol.Core.Game.SoundManager.Pause();
  }     
  
  _that.Pause = function() {
    if (!_that.Paused) {
      _that.Paused = true;
      clearInterval(_updateLoopId);
      cancelAnimationFrame(_renderLoopId);
      _that.Events.OnPause.Dispatch({ Message : 'Game paused' });
    }
  }

  _that.Play = function(controllerName) {
    if (_that.Paused) {
      if(controllerName){
        Pol.Core.Game.StateManager.SetState(controllerName);
      }
      _that.Paused = false;
      _updateLoopId = setInterval(_updateLoop, 1000 / 30); // fps
      _renderLoopId = requestAnimationFrame(_renderLoop);
      _that.Events.OnResume.Dispatch({ Message : 'Game resumed' });
    }
  }

  _that.InitGameLoop = function() {        
    var last = __getTimestamp();
    var dt   = 0;
    var __Game = Pol.Core.Game;
    _updateLoop = function(){
      var now = __getTimestamp();
      var dt = Math.min(1, (now - last) / 1000);      
      __Game.StateManager.Update(dt); 
      __Game.InputManager.Update(dt);
      __Game.EventManager.Update(dt);             
      last = now;                  
    }
    __clearContext = function(ctx){
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      //ctx.ImageSmoothingEnabled = false;
      ctx.clearRect(0, 0, _that.Canvas.width, _that.Canvas.height);
    }
    _renderLoop = function() {
      __clearContext(_that.Context);
      __Game.StateManager.Draw(_that.Context);
      _renderLoopId = requestAnimationFrame(_renderLoop);
    };
    return _that;
  } 
  
  _that.RefreshLayout = function(){ __onResize(); return _that; }           
  _that.InitCanvas    = function(o){
    _that.GameWidth    = o.width ||800;
    _that.GameHeight   = o.height||480;      
    _that.screenCenter = new Pol.Core.Math.Vector2( _that.GameWidth >> 1, _that.GameHeight >> 1);          
    _that.Canvas       = $.$('canvas', { id : 'canvas', width : _that.GameWidth, height : _that.GameHeight });
    _that.Context      =_that.Canvas.getContext("2d");
    document.body.appendChild(_that.Canvas);
    Pol.Core.Game.InputManager.BindEvents(_that.Canvas);                
    return _that;
  } 
        
  Pol.addEvent(window,'resize', __onResize);
  Pol.addEvent(window,'onorientationchange', __onResize);
  Pol.addEvent(window,'focus', __onFocus);
  Pol.addEvent(window,'blur', __onLostFocus);
    
  return _that;
  
}();

// ==================================================================================================== 
//
// Pol.Core.Game.StateManager
//
// ====================================================================================================
Pol.Core.Game.StateManager = function(){
  var _that   = { Events      : { OnStateChange  : new Pol.Core.Event('Pol.Core.Game.StateManager.Change') },
                  EmptyState  : { Draw : function(){}, Update : function(){}, Deactivate : function(){}, Activate : function(){} } };
  var _states = {};
  var _currentState = _that.EmptyState;
  
  _that.Add      = function(name, state){ _states[name] = state;  return _that;}
  _that.SetState = function(name,o){ 
    if(_currentState!=_states[name]){
      _currentState.Deactivate();
      _currentState = _states[name] || _that.EmptyState; 
      _that.Events.OnStateChange.Dispatch({ Message : 'Swicht controller to \'{0}\''.format(name) });
      _currentState.Activate(o);   
    }

    return _that;
  }  
  _that.Update   = function(dt) { _currentState.Update(dt); }
  _that.Draw     = function(ctx){ _currentState.Draw(ctx); }
  
  return _that;
}();

// ==================================================================================================== 
//
// Pol.Core.Game.InputManager
//
// ====================================================================================================
Pol.Core.Game.InputManager = function(){
  var _that   = { Events  : { OnTap     : new Pol.Core.Event('Pol.Core.Game.InputManager.Tap'), 
                              OnEndTap  : new Pol.Core.Event('Pol.Core.Game.InputManager.EndTap'),
                              OnMove    : new Pol.Core.Event('Pol.Core.Game.InputManager.Move')},
                  Data    : { }
                };
  
  var _last    = { MouseDown : false };
  var _current = { MouseDown : false , MouseDownPosition : { x : 0, y : 0 }, MousePosition : { x : 0, y : 0 } };
  
  _that.BindEvents = function(target){
  
    function _normalizePosition(e) {
      var x=-target.offsetLeft
      var y=-target.offsetTop;
      if(e.changedTouches){
        var touch = e.changedTouches[0];

        if (touch.pageX || touch.pageY) {
          x += touch.pageX;
          y += touch.pageY;
        }
        else {
          x += touch.clientX;
          y += touch.clientY;
        }
      }else{
        if (e.pageX || e.pageY) {
          x += e.pageX;
          y += e.pageY;
        }
        else {
          x += e.clientX;
          y += e.clientY;
        }   
      }

      return { x : Math.ceil( x * (1/Pol.Core.Game.CanvasRatioX)), y : Math.ceil( y * (1/Pol.Core.Game.CanvasRatioY))};
    }
    
    function __onMouseUp(eventArg){
      _current.MouseDown = false;
      _current.Button = eventArg.button || 0;
      _current.MousePosition = _current.MouseUpPosition = _normalizePosition(eventArg);     
      eventArg.preventDefault();
    }
    function __onMouseDown(eventArg){      
      _current.MouseDown = true;
      _current.Button = eventArg.button || 0;
      _current.MousePosition = _current.MouseDownPosition = _normalizePosition(eventArg);       
      eventArg.preventDefault();
    }    
    function __onMouseMove(eventArg){
      _current.MousePosition = _normalizePosition(eventArg); 
      eventArg.preventDefault();
    }
    
    Pol.addEvent(target, "touchstart", __onMouseDown);
    Pol.addEvent(target, "touchend", __onMouseUp);
    Pol.addEvent(target, "touchmove", __onMouseMove);

    Pol.addEvent(target, 'mousedown', __onMouseDown)
    Pol.addEvent(target, 'mouseup', __onMouseUp)
    Pol.addEvent(target, 'mousemove', __onMouseMove)

    _that.Data.Delta = new Pol.Core.Math.Vector2(0,0)

    return _that;  
  }

  _that.Update   = function(dt) {
    _that.Data.MouseDown = _current.MouseDown;  
    _that.Data.x   = _current.MousePosition.x;
    _that.Data.y   = _current.MousePosition.y; 
    _that.Data.Tap    = (_current.MouseDown == true && _last.MouseDown == false);
    _that.Data.Button = _current.Button;
    _that.Data.EndTap = (_current.MouseDown == false && _last.MouseDown == true);
    _that.Data.Move   = _current.MouseDown && ( _last.MousePosition.x != _current.MousePosition.x ||
                                                _last.MousePosition.y != _current.MousePosition.y ) ;
    _that.Data.Delta.x = _current.MouseDownPosition.x - _current.MousePosition.x;
    _that.Data.Delta.y = _current.MouseDownPosition.y - _current.MousePosition.y;                                                  

    if(_that.Data.Tap){
      _that.Events.OnTap.Dispatch({ Message : 'Tap at : {0}-{1}'.format( _that.Data.x, _that.Data.y),
                                    x       : _that.Data.x, 
                                    y       : _that.Data.y }); 
    }
    if(_that.Data.Move){
      _that.Events.OnMove.Dispatch({ Message : 'Move at : {0}-{1}'.format( _that.Data.x, _that.Data.y),
                                     x       : _that.Data.x, 
                                     y       : _that.Data.y }); 
    }
    if(_that.Data.EndTap){
      _that.Events.OnEndTap.Dispatch({ Message : 'EndTap at : {0}-{1}'.format( _that.Data.x, _that.Data.y),
                                       x       : _that.Data.x, 
                                       y       : _that.Data.y }); 
    } 
    Pol.apply(_last, _current);
  }

  return _that;
}();

// ==================================================================================================== 
//
// Pol.Core.Game.EventManager
//
// ====================================================================================================
Pol.Core.Game.EventManager = function(){
  var _that   = { Events  : { OnAdd  : new Pol.Core.Event('Pol.Core.Game.EventManager.OnAdd') } };  
  var _events = [];
  var _names  = {};
  var _eventCounter = 0;
  var _totalMilliseconds = 0;
    
  var _executeEvents = function(){
    _events.forEach( function(e){                    
      if(e.timeLeft < (_totalMilliseconds - e.birthTime)){
        e.callback(e);
        if(!e.isImmortal){
          e.lifes--;
          e.dead = (e.lifes == 0);           
        }
        e.birthTime = _totalMilliseconds;
      }            
      return;   
    });  
  }

  var _purgeList = function(){            
    var _count = _events.length;    
    for (var i=0; i < _count; i++){
      var e = _events[i];
      if (e.dead) {
        _names[e.___name].onTerminate();
        delete _names[e.___name];
        _events.remove(e);
        _count--;
      }
    }       
  }
  
  var _sortEvents = function(){
    _events.sort( function(a,b){
      if(a.timeLeft == b.timeLeft) return  0;
      if(a.timeLeft <  b.timeLeft) return -1;
      return 1;
    })
  }
    
  var __gameEvent = function(callbackfn, delay,times, onTerminate){
    this.timeLeft   = delay; 
    this.birthTime  = -1; 
    this.dead       = false;  
    this.isImmortal = times==0;  
    this.lifes      = times;
    this.callback   = callbackfn || function(){};
    this.onTerminate   = onTerminate || function(){};
  }  
  
  _that.buildEvent = function(callback,delay,times, onTerminate){
    return new __gameEvent(callback,delay,times, onTerminate);     
  }  
     
  _that.reset = function(){
    _events = [];
    _names  = {};    
    _totalMilliseconds = _eventCounter = 0;
  }

  _that.getNamedEvent = function(name){
    return _names[name];
  }

  _that.removeEvent = function(name){       
    if(name in _names){      
      _events.remove(_names[name]);
      _names[name].onTerminate();
      delete _names[name];    
    }    
    return _that;
  }

  _that.addEvent = function(event, name){    
    event.___name =  name ? name : 'event_{0}'.format(++_eventCounter);
    event.birthTime = _totalMilliseconds;    
    _names[event.___name] = event;
    _events.add(event);
    _that.Events.OnAdd.Dispatch({ Message : '{0}'.format(event.___name) });
    _sortEvents();
    return _that;
  }
    
  _that.Update = function(dt){
    _totalMilliseconds += dt*1000;
    _executeEvents();
    _purgeList();      
  }
  
  return _that;              
}();

// ==================================================================================================== 
//
// Pol.Core.Game.Configuration
//
// ====================================================================================================
Pol.Core.Game.Configuration = function(){

  var _that   = { Events  : { OnChange  : new Pol.Core.Event('Pol.Core.Game.Configuration.OnChange') } };

  var _default = { 
    'soundsEnabled' : true,
    'score'         : -1
  };
  var _value   = _default.Create();
  var _data    = localStorage;

  _that.resetGame = function(){
    
  }
  
  _that.setValue = function(key, value){
    if(_value[key]!=value){
      _value[key] = value;     
      _that.Events.OnChange.Dispatch( { Message : '{0}={1}'.format(key, value) } );
      _that.save();
    }
    return _that; 
  }
  _that.getValue = function(key){
    return _value[key];
  }
  _that.load = function(){
    if(_data && _data.length>0){
      _value = JSON.parse(_data['global']);
    }    
    return _that
  }
  _that.save = function(){
    if(_data){
      _data.global = JSON.stringify(_value);
    }    
    return _that
  }

  return _that.load();   
}()

// ==================================================================================================== 
//
// Pol.Core.Game.SoundManager
//
// ====================================================================================================
Pol.Core.Game.SoundManager = function(){

  var _soundsEnabled =  Pol.Core.Game.Configuration.getValue('soundsEnabled');
  var _background = new Audio();
  var _that   = { Events            : { OnEnabledChange  : new Pol.Core.Event('Pol.Core.Game.SoundManager.OnEnabledChange') }, 
                  isSoundEnabled    : function() { return _soundsEnabled; },
                  toggleSoundState  : function() {
                    _soundsEnabled ? _that.disableSounds() : _that.enableSounds();
                    return _that; 
                  },
                  enableSounds : function() {
                    if(!_soundsEnabled){
                      _soundsEnabled=true;
                      _background.muted=false;
                      _background.play();
                      _that.Events.OnEnabledChange.Dispatch({ Message : '{0}'.format(_soundsEnabled) });
                      Pol.Core.Game.Configuration.setValue('soundsEnabled', _soundsEnabled);
                    }
                    return _that;    
                  },
                  disableSounds : function(){
                    if(_soundsEnabled){
                      _background.muted=true;
                      _soundsEnabled=false;
                      _that.Events.OnEnabledChange.Dispatch({ Message : '{0}'.format(_soundsEnabled) });
                      Pol.Core.Game.Configuration.setValue('soundsEnabled',_soundsEnabled);
                    }
                    return _that;
                  },
                  playSound : function(name){
                    if(_soundsEnabled) Pol.Core.Resources.GetAsset(name).play();
                  },
                  loopSound : function(name){                    
                    _background = Pol.Core.Resources.GetAsset(name);                    
                    _background.volume = .2;
                    _background.loop = true;
                    if(!_soundsEnabled) return;
                    _background.play()
                  },
                  CreateSoundPool : __createSoundPool, 
                  Pause           : function(){ _background.pause() },
                  Resume          : function(){ if(_soundsEnabled)_background.play(); }
  };

  function __createSoundPool(size, name) {
    var _that = { pool  : [], index : 0 };    
  	_that.init = function() {
  		for (var i = 0; i < size; i++) {  				
  			var __audio = new Audio(Pol.Core.Resources.GetAsset(name).src);
  			__audio.volume = 1;  				
  			_that.pool[i] = __audio;
  		}
      return _that;
  	};    
  	_that.get = function(volume) {
  		if(_that.pool[_that.index].currentTime == 0 || _that.pool[_that.index].ended) {
  		  if(_soundsEnabled){
          _that.pool[_that.index].volume = volume || 1.0;
          _that.pool[_that.index].play();
        }
  		}
  		_that.index = (_that.index + 1) % size;
      return _that;
  	};
    return  _that;
  }

  return _that;              
}();

// ==================================================================================================== 
//
// Pol.Core.Math.Vector2
//
// http://docs.closure-library.googlecode.com/git/closure_goog_vec_vec2.js.source.html
// http://docs.closure-library.googlecode.com/git/closure_goog_math_vec2.js.source.html
// http://www.cgrats.com/javascript-2d-vector-library.html
// ==================================================================================================== 
Pol.Core.Math.Vector2                 = function(x,y) { this.x = x; this.y = y;};

Pol.Core.Math.Vector2_ZERO            = new Pol.Core.Math.Vector2(0.0, 0.0);
Pol.Core.Math.Vector2_UNIT_X          = new Pol.Core.Math.Vector2(1.0, 0.0);
Pol.Core.Math.Vector2_UNIT_Y          = new Pol.Core.Math.Vector2(0.0, 1.0);
Pol.Core.Math.Vector2_NEGATIVE_UNIT_X = new Pol.Core.Math.Vector2(-1.0, 0.0);
Pol.Core.Math.Vector2_NEGATIVE_UNIT_Y = new Pol.Core.Math.Vector2(0.0, -1.0);
Pol.Core.Math.Vector2_UNIT_SCALE      = new Pol.Core.Math.Vector2(1.0, 1.0);

Pol.Core.Math.Vector2.sum        = function(a, b) { return new Pol.Core.Math.Vector2(a.x + b.x, a.y + b.y); };
Pol.Core.Math.Vector2.difference = function(a, b) { return new Pol.Core.Math.Vector2(a.x - b.x, a.y - b.y);};
Pol.Core.Math.Vector2.dot        = function(a, b) { return a.x * b.x + a.y * b.y;};
Pol.Core.Math.Vector2.cross      = function(a, b) { return a.x * b.y - a.y * b.x;};
Pol.Core.Math.Vector2.distance   = function(a, b) { var dx = a.x - b.x; var dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy);};
Pol.Core.Math.Vector2.distanceSquared = function(a, b) { var dx = a.x - b.x; var dy = a.y - b.y; return dx * dx + dy * dy; };
Pol.Core.Math.Vector2.equals     = function(a, b) { return this == vector || (a.x == b.x && a.y == b.y);};
Pol.Core.Math.Vector2.lerp       = function(a, b, f, resultVec) {
  var x = a.x, y = a.y;
  resultVec.x = (b.x - x) * f + x;
  resultVec.y = (b.y - y) * f + y;
  return resultVec;
}

Pol.Core.Math.Vector2.rotateAroundPoint = function(v, axisPoint, angle) { return v.clone().subtract(axisPoint).rotate(angle).add(axisPoint);};

Pol.Core.Math.Vector2.prototype.set           = function(x,y)   { this.x=x; this.y=y;};
Pol.Core.Math.Vector2.prototype.clone         = function()      { return new Pol.Core.Math.Vector2(this.x, this.y); };
Pol.Core.Math.Vector2.prototype.length        = function()      { return Math.sqrt(this.x * this.x + this.y * this.y);};
Pol.Core.Math.Vector2.prototype.lengthSquared = function()      { return this.x * this.x + this.y * this.y; };
Pol.Core.Math.Vector2.prototype.invert        = function()      { this.x = -this.x; this.y = -this.y; return this; };
Pol.Core.Math.Vector2.prototype.cross         = function(vector){ return this.x * vector.y - this.y * vector.x;}
Pol.Core.Math.Vector2.prototype.dot           = function(vector){ return this.x * vector.x + this.y * vector.y;};
Pol.Core.Math.Vector2.prototype.scale         = function(sx, sy){ this.x *= sx; this.y *= sy; return this; };
Pol.Core.Math.Vector2.prototype.normalize      = function()     { var _d = 1 / this.length(); return this.scale(_d,_d); };
Pol.Core.Math.Vector2.prototype.normalisedCopy = function()     { return new Pol.Core.Math.Vector2(this.x,this.y).normalise(); };
Pol.Core.Math.Vector2.prototype.add           = function(vector){ this.x += vector.x; this.y += vector.y; return this; };
Pol.Core.Math.Vector2.prototype.subtract      = function(vector){ this.x -= vector.x; this.y -= vector.y; return this;};
Pol.Core.Math.Vector2.prototype.mul           = function(scalar){ this.x *= scalar; this.y *= scalar; return this;};
Pol.Core.Math.Vector2.prototype.divide        = function(scalar){ this.x /= scalar; this.y /= scalar; return this;};
Pol.Core.Math.Vector2.prototype.equals        = function(vector){ return this == vector || !!vector && this.x == vector.x && this.y == vector.y; };
Pol.Core.Math.Vector2.prototype.rotate        = function(angle) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  var newX = this.x * cos - this.y * sin;
  var newY = this.y * cos + this.x * sin;
  this.x = newX;
  this.y = newY;
  return this;
};

// ==================================================================================================== 
//
// Pol.Core.Math.Box
//
// ==================================================================================================== 
Pol.Core.Math.Box = function(t, r, b, l) {
  this.left = l;
  this.top = t;
  this.right = r;
  this.bottom = b;
};
Pol.Core.Math.Box.prototype.clone  = function() { return new Pol.Core.Math.Box(this.top, this.right, this.bottom, this.left); };
Pol.Core.Math.Box.prototype.toRect = function() { return new Pol.Core.Math.Rect(this.left, this.top, this.right-this.left, this.bottom-this.top); };
Pol.Core.Math.Box.prototype.centerPoint = function() { return new Pol.Core.Math.Vector2( this.left + ((this.right-this.left) >> 1), this.top + ((this.bottom-this.top) >> 1)); };

// ==================================================================================================== 
//
// Pol.Core.Math.Rect
// 
// http://docs.closure-library.googlecode.com/git/closure_goog_math_rect.js.source.html
// ====================================================================================================
Pol.Core.Math.Rect = function(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h;
};
Pol.Core.Math.Rect.prototype.clone = function()            { return new Pol.Core.Math.Rect(this.left, this.top, this.width, this.height); };
Pol.Core.Math.Rect.prototype.toBox = function()            { return new Pol.Core.Math.Box(this.top, this.left + this.width, this.top + this.height, this.left); };
Pol.Core.Math.Rect.prototype.centerPoint = function()      { return new Pol.Core.Math.Vector2( this.left + (this.width >> 1), this.top + (this.height >> 1));};
Pol.Core.Math.Rect.prototype.contains    = function(other) {
  if (other instanceof Pol.Core.Math.Rect) {
    return this.left <= other.left &&
           this.left + this.width >= other.left + other.width &&
           this.top <= other.top &&
           this.top + this.height >= other.top + other.height;
  } else { 
    return other.x >= this.left &&
           other.x <= this.left + this.width &&
           other.y >= this.top &&
           other.y <= this.top + this.height;
  }
};

Pol.Core.Math.Random = function(max, min)        { return Math.floor(Math.random()*(max-min+1)+min); }
Pol.Core.Math.Clamp  = function(value, min, max) { return Math.min(Math.max(value, min), max);};

// ==================================================================================================== 
//
// Pol.Core.Game.Collision 
//
// ====================================================================================================             
Pol.Core.Game.Collision = {

  CreateCircle : function(x,y,radius,o){
    var _that = { x             : x, 
                  y             : y, 
                  radius        : radius ,
                  radiusSquared : radius*radius, 
                  contains      : function(x,y){
                    if(arguments.length==1){
                      return ((this.x-x.x)*(this.x-x.x)) + ((this.y-x.y)*(this.y-x.y)) < this.radiusSquared;  
                    } 
                    return ((this.x-x)*(this.x-x)) + ((this.y-y)*(this.y-y)) < this.radiusSquared;
                  }};
    if(o) Pol.apply(_that, o);                      
    return _that
  },
  CreateRectangle : function(x,y,w,h){
    return new Pol.Core.Math.Rect(x,y,w,h);
  },
  FindButtonAt : function(buttons, point){
    var __b;
    buttons.some( function(b){
                    if( b.contains(point) || b.contains(point.x, point.y) ){
                      __b = b; 
                      return true;
                    }
                    return false;
                  });
    return __b;
  },
  FindAt : function(values, p, propName){
    var __value;
    values.some(function(o){
                  var __rec = propName ? o[propName] : o;
                  if( __rec.contains(p)){
                    __value = o; 
                    return true;
                  }
                  return false;
                });
    return __value;
  }
} 

// ==================================================================================================== 
//
// Pol.Core.Game.FadeControler
//
// ==================================================================================================== 
Pol.Core.Game.FadeControler  = function(delay) {
  var _that   = { value : 0 } 
  var _timePassed = 0.0;
  var _delay = delay;
  var _state = '';
  var _callback;

  _that.reset        = function(delay){ _timePassed = 0.0; _delay = delay; _that.value=0;}
  _that.isFadingDown = function(){ return _state=='down'; } 
  _that.isFadingUp   = function(){ return _state=='up'; }

  _that.fadeDown = function (callback, value){
    _callback   = callback;    
    _state      = 'down';
    _that.value = arguments.length==2 ? value : 100;
    _timePassed = arguments.length==2 ? (100 - _that.value) / 100.0 * _delay  : 0.0;
    return _that;
   }

  _that.fadeUp = function (callback, value){
    _callback = callback; 
    _state = 'up';
    _that.value = arguments.length==2 ? value : 0;
    _timePassed = arguments.length==2 ? (_that.value) / 100.0 * _delay  : 0.0;
    return _that;
  }
  
  _that.update = function(dt){
    _timePassed += dt*1000;
    if(_that.isFadingDown())    _that.value = Math.max(0, 100-(_timePassed/_delay * 100));
    else if(_that.isFadingUp()) _that.value = Math.min(100, _timePassed/_delay * 100);
    if (_state!='' && _delay<_timePassed){
      _state = '';
      if(_callback) _callback();
    }
  }
  
  return _that;
}


