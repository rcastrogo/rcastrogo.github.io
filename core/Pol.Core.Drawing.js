/// <reference path="Pol.Core.Game.js" />

// ==================================================================================================== 
//
// Pol.Core.Drawing
//
// ====================================================================================================
Pol.Core.Drawing = function(){

  var _that = {};
  
  _that.Clear = function(color){
    Pol.Core.Game.Context.fillStyle = color;
    Pol.Core.Game.Context.fillRect(0,0, Pol.Core.Game.GameWidth, Pol.Core.Game.GameHeight);
    return _that;
  }

  _that.ClearShadow = function(){
    var __ctx = Pol.Core.Game.Context;
    __ctx.shadowOffsetX = 0;   
    __ctx.shadowOffsetY = 0;   
    __ctx.shadowBlur = 0;   
    __ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    return _that; 
  }
  _that.SetShadow = function(x,y,blur,color){
    var __ctx = Pol.Core.Game.Context;
    __ctx.shadowOffsetX = x;   
    __ctx.shadowOffsetY = y;   
    __ctx.shadowBlur = blur;   
    __ctx.shadowColor = color;
    return _that;
  }

  _that.DrawCircle = function(circle,lineWidth,strokeStyle,fillStyle){
    var __ctx = Pol.Core.Game.Context;
    __ctx.beginPath();
    __ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    __ctx.fillStyle = fillStyle;
    __ctx.fill();
    __ctx.lineWidth = lineWidth;
    __ctx.strokeStyle = strokeStyle;
    __ctx.stroke();
    return _that;
  }

  _that.roundRect = function (x, y, width, height, radius, fill, stroke) {
    var cornerRadius = { upperLeft: 0, upperRight: 0, lowerLeft: 0, lowerRight: 0 };
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "object") {
        for (var side in radius) {
            cornerRadius[side] = radius[side];
        }
    }
    var __ctx = Pol.Core.Game.Context;
    __ctx.beginPath();
    __ctx.moveTo(x + cornerRadius.upperLeft, y);
    __ctx.lineTo(x + width - cornerRadius.upperRight, y);
    __ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.upperRight);
    __ctx.lineTo(x + width, y + height - cornerRadius.lowerRight);
    __ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.lowerRight, y + height);
    __ctx.lineTo(x + cornerRadius.lowerLeft, y + height);
    __ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.lowerLeft);
    __ctx.lineTo(x, y + cornerRadius.upperLeft);
    __ctx.quadraticCurveTo(x, y, x + cornerRadius.upperLeft, y);
    __ctx.closePath();
    if (fill) {
      __ctx.fill();
    }
    if (stroke) {
      __ctx.stroke();
    }
  }

  _that.createBuffer = renderToCanvas = function (width, height, renderFunction) {
    var buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'));
    return buffer;
  };

  _that.grayscale = function __gray(ctx){
    var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    var data = imageData.data;
    for(var i = 0; i < data.length; i += 4) {
      var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      // red
      data[i] = brightness;
      // green
      data[i + 1] = brightness;
      // blue
      data[i + 2] = brightness;
    }
    ctx.putImageData(imageData, 0, 0);
  }


  return _that;

} ();

// ==================================================================================================== 
//
// Pol.Core.SpriteSheet
//
// ====================================================================================================
Pol.Core.SpriteSheet = function(name,rect){
  this.assetName = name;
  this.rectangle = rect;
}

// ==================================================================================================== 
//
// Pol.Core.TileSet
//
// ====================================================================================================
Pol.Core.TileSet = function (o) {  
  // ========================================================
  // Private
  // ========================================================
  this.texture    = o.assetName ? Pol.Core.Resources.GetAsset(o.assetName) : o.texture;
  this.tileWidth  = o.tileWidth  || this.texture.width;
  this.tileHeight = o.tileHeight || this.texture.height;
  var _bounds     = o.bounds     || new Pol.Core.Math.Rect(0, 0, o.width || this.texture.width, o.height || this.texture.height);

  // ========================================================
  // Public
  // ========================================================
  this.tileRectangle = function(tileIndex) {
    var __top = _bounds.top + Math.floor((tileIndex / (_bounds.width / this.tileWidth))) * this.tileHeight;
    var __left = _bounds.left + (tileIndex * this.tileWidth) % ((_bounds.width / this.tileWidth) * this.tileWidth);
    return new Pol.Core.Math.Rect(__left, __top , this.tileWidth, this.tileHeight);
  }
  this.tilePosition = function(tileIndex, position) {
    position.y = _bounds.top + Math.floor((tileIndex / (_bounds.width / this.tileWidth))) * this.tileHeight;
    position.x = _bounds.left + (tileIndex * this.tileWidth) % ((_bounds.width / this.tileWidth) * this.tileWidth);
    return position;
  }   
  // _that.blocks = function() { return 6;// (int)(_texture.width / _tileWidth) * (int)(_texture.height / _tileHeight); } }
} 
Pol.Core.TileSet.createWithSpriteSheet = function(s,w,h){
  return new Pol.Core.TileSet({ assetName  : s.assetName, 
                                tileWidth  : arguments.length>1 ? w : s.rectangle.width, 
                                tileHeight : arguments.length>1 ? h : s.rectangle.height, 
                                bounds     : s.rectangle });
} 

Pol.Core.TileSet.prototype.centerPoint   = function() {return new Pol.Core.Math.Vector2(this.tileWidth >> 1, this.tileHeight >> 1); };
Pol.Core.TileSet.prototype.centerPointOf = function(tileIndex) { return this.tileRectangle(tileIndex).centerPoint(); }; 
Pol.Core.TileSet.prototype.draw          = function(ctx, index, position, scale){
  var r = this.tileRectangle(index);  
  this.texture.Draw(ctx, r.left, r.top, r.width, r.height, position.x, position.y, r.width * (scale||1), r.height * (scale||1));   
}
// ==================================================================================================== 
//
// Pol.Core.Animation
//
// ====================================================================================================
Pol.Core.Animation = function(o) {

  var AnimationInfo = function(index, time) {
    this.frameIndex = parseInt(index);
    this.duration = parseInt(time);
  }

  var _animations = {}; // Dictionary<string, AnimationInfo[]>
  var _elapsedTime = 0.0;
  var _currentAnimation = "";
  var _frames = 1;
  var _frameIndex = 0;
  var _frametime = 500;

  if(o.info){ // Animation(string info)  
    var __LastFrameDuration = 500;
    var __FrameIndex = 0;
    o.info.Split('#').forEach( function(__Animation) {
        var __Name      = __Animation.Split(':')[0];
        var __FrameInfo = __Animation.Split(':')[1];
        var __Frames    = []; // new List<AnimationInfo>();
        __FrameInfo.Split(',').forEach( function(__Frame) {
            if (__Frame.Contains('.')) {
              __LastFrameDuration = __Frame.Split('.')[1];
              __FrameIndex = __Frame.Split('.')[0];
            }
            else {
              __FrameIndex = __Frame;
            }
            __Frames.Add(new AnimationInfo( __FrameIndex, __LastFrameDuration));
        });
        _animations[__Name] = __Frames;
        if(_currentAnimation=='') setCurrentAnimation(__Name);
    });     
  }else{
    //    public Animation(Dictionary<string, AnimationInfo[]> animationInfo) {
    //      _animations = animationInfo;
    //      _currentAnimation = _animations.Keys.ToArray()[0];
    //      _frameIndex = 0;
    //      _frametime = _animations[_currentAnimation][0].Duration;
    //      _frames = _animations[_currentAnimation].Count();
    //    }  
  }

  this.getCurrentAnimation = function()    { return _currentAnimation; }
  this.setCurrentAnimation = function(animationName){
    if(_currentAnimation==animationName) return;
    _currentAnimation=animationName;
    _frameIndex = 0;
    _frametime = _animations[_currentAnimation][_frameIndex].duration;
    _frames = _animations[_currentAnimation].length;
  }
  
  this.getCurrentFrame = function()     { return _animations[_currentAnimation][_frameIndex].frameindex; }
  this.setCurrentFrame = function(index){ _frameIndex = _animations[_currentAnimation][index].frameindex; }

  this.update = function (dt) {
    _elapsedTime += dt;
    if (_elapsedTime >= _frametime) {
      _elapsedTime = 0;
      _frameIndex += 1;
      if (_frameIndex >= _frames) _frameIndex = 0;
      _frametime = _animations[_currentAnimation][_frameIndex].duration;
    }
  }

}

// ==================================================================================================== 
//
// Pol.Core.Sprite
// public Sprite(TileSet tileSet) 
// public Sprite(TileSet tileSet, Animation animation)
// ====================================================================================================
Pol.Core.Sprite = function(o){   
  this.tileSet     = o.tileSet,  
  this.width       = o.tileSet.tileWidth,
  this.height      = o.tileSet.tileHeight,
  this.animation   = o.animation , 
  this.radius      = o.tileset ? Math.min(o.tileSet.tileWidth >> 1, o.tileSet.tileHeight >> 1)  : -1,
  this.scale       = new Pol.Core.Math.Vector2(1,1),
  this.rotation    = 0.0,
  this.state       = '',
  this.bounds      = new Pol.Core.Math.Rect(0,0,32,32),
  this.position    = new Pol.Core.Math.Vector2(0,0),
  this.origin      = new Pol.Core.Math.Vector2(0,0),
  this.speed       = new Pol.Core.Math.Vector2(0,0),
  this.state       = '',
  this.getCurrentFrame = function(){ return this.animation ? this.animation.getCurrentFrame() : 0; },
  this.move            = function(x,y){ this.position.x+=x; this.position.y+=y; if(this.checkBounds) this.checkBounds();return this; },
  this.moveTo          = function(x,y){ this.position.x=x; this.position.y=y; if(this.checkBounds) this.checkBounds();return this; },
  this.stop            = function()   { this.position.set(0,0);return this;}, 
  this.centerOrigin    = function()   { this.origin.x = this.width >> 1;this.origin.y = this.hight >> 1;}    
  // setFlip(Boolean flipHorizontal, Boolean flipVertical)
  // IsFaceLeft
}

Pol.Core.Sprite.prototype.draw = function(ctx, position, frameIndex, offset, origin, scale, angle){
  var __texture   = this.tileSet.texture;    
  var __rect      = this.tileSet.tileRectangle( frameIndex || this.getCurrentFrame()); 
  var __offset    = offset || Pol.Core.Math.Vector2_ZERO;
  var __origin    = origin || this.origin;
  var __scale     = scale || this.scale;
  var __angle     = angle || this.rotation;
  var __position  = position || this.position ;
  if(arguments.length==7) __angle = angle; 


  if(!(Pol.floatEqual(__scale.x,1.0) && Pol.floatEqual(__scale.y,1.0) && Pol.floatEqual(__angle, 0.0))){
    ctx.save();
    ctx.translate(__position.x + __origin.x, __position.y + __origin.y); 
    ctx.rotate(__angle); 
    ctx.scale(__scale.x, __scale.y); 
    this.tileSet.texture.Draw(ctx, __rect.left, __rect.top, __rect.width, __rect.height, 
                              -__origin.x, -__origin.y, this.width, this.height );
    ctx.restore(); 
    return;
  } 
  this.tileSet.texture.Draw(ctx, __rect.left, __rect.top, __rect.width, __rect.height, 
                            __position.x - __offset.x - __origin.x, __position.y - __offset.y - __origin.y, this.width, this.height );
                              
}




//(function() {

//  var Camera = function(context, settings) {
//    settings = settings || {};
//    this.distance = 1000.0;
//    this.lookat = [0,0];
//    this.context = context;
//    this.fieldOfView = settings.fieldOfView || Math.PI / 4.0;
//    this.viewport = {
//      left: 0,
//      right: 0,
//      top: 0,
//      bottom: 0,
//      width: 0,
//      height: 0,
//      scale: [1.0, 1.0]
//    };
//    this.updateViewport();
//  };

//  Camera.prototype = {
//    begin: function() {
//      this.context.save();
//      this.applyScale();
//      this.applyTranslation();
//    },
//    end: function() {
//      this.context.restore();
//    },
//    applyScale: function() {
//      this.context.scale(this.viewport.scale[0], this.viewport.scale[1]);
//    },
//    applyTranslation: function() {
//      this.context.translate(-this.viewport.left, -this.viewport.top);
//    },
//    updateViewport: function() {
//      this.aspectRatio = this.context.canvas.width / this.context.canvas.height;
//      this.viewport.width = this.distance * Math.tan(this.fieldOfView);
//      this.viewport.height = this.viewport.width / this.aspectRatio;
//      this.viewport.left = this.lookat[0] - (this.viewport.width / 2.0);
//      this.viewport.top = this.lookat[1] - (this.viewport.height / 2.0);
//      this.viewport.right = this.viewport.left + this.viewport.width;
//      this.viewport.bottom = this.viewport.top + this.viewport.height;
//      this.viewport.scale[0] = this.context.canvas.width / this.viewport.width;
//      this.viewport.scale[1] = this.context.canvas.height / this.viewport.height;
//    },
//    zoomTo: function(z) {
//      this.distance = z;
//      this.updateViewport();
//    },
//    moveTo: function(x, y) {
//      this.lookat[0] = x;
//      this.lookat[1] = y;
//      this.updateViewport();
//    },
//    screenToWorld: function(x, y, obj) {
//      obj = obj || {};
//      obj.x = (x / this.viewport.scale[0]) + this.viewport.left;
//      obj.y = (y / this.viewport.scale[1]) + this.viewport.top;
//      return obj;
//    },
//    worldToScreen: function(x, y, obj) {
//      obj = obj || {};
//      obj.x = (x - this.viewport.left) * (this.viewport.scale[0]);
//      obj.y = (y - this.viewport.top) * (this.viewport.scale[1]);
//      return obj;      
//    }
//  };

//  this.Camera = Camera;
//  
//}).call(this);



// ==================================================================================================== 
//
// Pol.Core.Game.Map
//
// ==================================================================================================== 
Pol.Core.Game.Map  = function() {
  var _that   = { layers    : [],
                  emptyRows : []
                };
  
  var _blockWidth  = 48; // __Values["BlockWidth"]
  var _blockHeight = 48; // __Values["BlockHeight"]
  
  var _mapWidth  = 20; //__Values["Width"]
  var _mapHeight = 10; //__Values["Height"]
  var _top = 0;        //__Values["Top"];
  var _left = 0;       //__Values["Left"];
  var _viewportWidth  = 800;       // ["ViewportWidth"];
  var _viewportHeight = 480;       // ["ViewportHeight"];
  var _scrollLimitX = _viewportWidth  >> 1;
  var _scrollLimitY = _viewportHeight >> 1;
  var _paddingBottom = 0;       //__Values["PaddingBottom"];
  var _paddingTop    = 0;       //__Values["PaddingTop"];
  var _paddingLeft   = 0;       //__Values["PaddingLeft"];
  var _paddingRight  = 0;       //__Values["PaddingRight"];
  var _x = 0;
  var _y = 0;
//  _cameraMode = int.Parse(__Values["CameraMode"]);
    
  // =========================================================================================================================================
  //    Constructor 
  // =========================================================================================================================================
  var _blocksTileSet = Pol.Core.TileSet.createWithSpriteSheet(GlypyGame.SpriteSheets.SpriteSheet01.getSprite('Blocks'),48,48);
    
  _that.move = function(x,y){
    _x+= x;
    _y+= y;
  }
 
  // ===============================================================================================
  // Map Layers
  // ===============================================================================================
  _that.loadMap = function(__LayerData){
    var __layerCount = 2;  
   _that.layers      = new Array(_mapHeight * _mapWidth * __layerCount);      
   _that.emptyRows   = new Array(_mapHeight * __layerCount);
      
    for (var __L=0; __L<__layerCount; __L++){         
      for(var y=0; y<_mapHeight;y++){               
        var __sum = 0;
        var __rowOffset = (__L * _mapHeight * _mapWidth) + y * _mapWidth  ;
        __LayerData[y + (__L * _mapHeight)].split(',').forEach( function(value,i){
          if(i>=_mapWidth) return; 
          if (value.length>0){
            __sum += _that.layers[__rowOffset+i] = parseInt(value);
          }else{
             _that.layers[__rowOffset+i] = 0;
          }                       
        });
        _that.emptyRows[__L*_mapHeight+y] = __sum;
      }         
    }
  }  
  _that.update = function(dt){

  }
  
  var __pos = { x:0, y:0};
  
  _that.draw = function(ctx){        
    ctx.translate(-_x,-_y);   
    var __X        = (_x/_blockWidth)>>0;                   
    var __Y        = (_y/_blockHeight)>>0;      
    var __cols     = 2 + (_viewportWidth/_blockWidth)>>0;
    var __rows     = 2 + (_viewportHeight/_blockHeight)>>0;       
    var __EndX     = Math.min(__cols+__X, _mapWidth);          
    var __EndY     = Math.min(__rows+__Y, _mapHeight);                       
        
    for (var __L=0; __L<2; __L++){
      var __layerOffset = (__L * _mapHeight * _mapWidth);
      for (var __row=__Y; __row<__EndY; __row++){
        var __rowOffset = __layerOffset + __row*_mapWidth; 
        if (_that.emptyRows[__L*_mapHeight+__row]>0){
          for (var __column=__X; __column<__EndX; __column++){                                          
            var __blockIndex = _that.layers[__rowOffset+__column] || 0;            
            if (__blockIndex != 0){
              _blocksTileSet.tilePosition(__blockIndex, __pos);                                  
              _blocksTileSet.texture.Draw(ctx, __pos.x, __pos.y, _blockWidth, _blockHeight, (__column    * _blockWidth), (__row * _blockHeight), _blockWidth, _blockHeight);
            }
          }
        }
      }
      //if (__LayerIndex == _entityLayerIndex) OnRenderEntities(this, sprite);
    }  
    ctx.translate(_x,_y);
  }  
  return _that;  
} 