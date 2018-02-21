/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />

// ==============================================================
//
// PuZZGame.StateControllers.GameController
//
// ==============================================================
PuZZGame.StateControllers.GameController = function(){

  var _that   = {};
  var _init   = false;
  var _padding = 10;
  
  var _btnNew, _btnShow, _btnRefresh, _btnBackground, _btnHome, _btnMusic;
  var _buttons;

  var _puzzData; 
  var _InputManager;
  var _ClapSoundPool;
  var _ParticleEmitter;
  var _buttonsTileSet;

  var _states = Pol.Core.StateManager();
  
  _that.Update     = function(dt) { _states.state.update(dt); }
  _that.Draw       = function(ctx){ _states.state.draw(ctx);  }
  _that.Deactivate = function()   { _puzzData = undefined     }; 
  _that.Activate   = function(o)  {
    if(!_init){ 
      // =================================== ===================== 
      // Input
      // =================================== ===================== 
      _InputManager = Pol.Core.Game.InputManager;
      // =================================== ===================== ===================== ===================== =====================
      // Buttons
      // =================================== ===================== ===================== ===================== =====================
      var _BTN_RADIUS = 30;
      var _BTN_Y = Pol.Core.Game.GameHeight - _BTN_RADIUS*2 - _padding;
      var _DIST  = _BTN_RADIUS*2 + _padding;
      var _POS   = _BTN_RADIUS + _padding;

      _btnNew        = Pol.Core.Game.Collision.CreateCircle(_POS, _BTN_Y, _BTN_RADIUS, { ImageIndex : 1 })
      _btnShow       = Pol.Core.Game.Collision.CreateCircle(_POS+=_DIST, _BTN_Y, _BTN_RADIUS, { ImageIndex : 4 })
      _btnRefresh    = Pol.Core.Game.Collision.CreateCircle(_POS+=_DIST, _BTN_Y, _BTN_RADIUS, { ImageIndex : 2 })
      _btnBackground = Pol.Core.Game.Collision.CreateCircle(_POS+=_DIST, _BTN_Y, _BTN_RADIUS, { ImageIndex : 3 })
      _btnMusic      = Pol.Core.Game.Collision.CreateCircle(_POS+=_DIST, _BTN_Y, _BTN_RADIUS, { ImageIndex : 7 })
      _btnHome       = Pol.Core.Game.Collision.CreateCircle(_POS+=_DIST*2, _BTN_Y, _BTN_RADIUS, { ImageIndex : 0 })
      _buttons       = [ _btnNew, _btnShow, _btnRefresh, _btnBackground, _btnHome, _btnMusic];

      _btnNew.onclick        = function(){ __onButtonClick(_btnNew);  };
      _btnShow.onclick       = function(){ __onButtonClick(_btnShow); };
      _btnRefresh.onclick    = function(){ __onButtonClick(_btnRefresh); };
      _btnBackground.onclick = function(){ __onButtonClick(_btnBackground); };
      _btnMusic.onclick      = function(){ __onButtonClick(_btnMusic); };
      _btnHome.onclick       = function(){ __onButtonClick(_btnHome); };

      _buttonsTileSet = new Pol.Core.TileSet({ assetName  : 'Puzz.Buttons', tileWidth  : 50, tileHeight : 50 });
      _ClapSoundPool = Pol.Core.Game.SoundManager.CreateSoundPool(3, 'CLAP.Sound').init();     
      _ParticleEmitter = PuZZGame.ParticleSystem(100);
      _init=true;     
    }   
    _states.setState('enter');
  };
    
  var _fadeControler;
  // =============================================================================================================================================
  // 
  //  Enter
  // 
  // =============================================================================================================================================
  _states.enter.activate = function(){
    _fadeControler = new Pol.Core.Game.FadeControler(1000)
                                      .fadeUp( function(){ 
                                        __initPuzzle();
                                        _states.setState('idle');                                        
                                      } );
    document.body.style.backgroundImage = 'url({0})'.format(PuZZGame.Backgrounds.ImageUrl(0));
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
  //  Idle
  // 
  // =============================================================================================================================================
  _states.idle.activate = function(){  

  };
  _states.idle.update = function(dt){ 
    
    _ParticleEmitter.update(dt);
    
    var __IData = Pol.Core.Game.InputManager.Data;    
    if(__IData.Tap){ 
            
      if(_buttons.some( function(b){
                          if( b.contains(__IData.x - _padding, __IData.y - _padding)){
                            b.onclick();
                            __IData.cancelEndTap=true;
                            return true;
                          }
                          return false;
                        })) return;
    }
       
    if(__IData.Tap){ 
      _puzzData.target = _puzzData.pieceAt(Pol.Core.Game.InputManager.Data);
      if(_puzzData.target && !_puzzData.target.isInPlace){        
        (_puzzData.target.group||[_puzzData.target]).forEach( function(p){
          p._position = p.position.clone();
          p.activate();
        });
        _puzzData.sort();
        return;
      }
      _puzzData.target = undefined;
    }
    if(__IData.Move && _puzzData.target ){
      var __delta = Pol.Core.Game.InputManager.Data.Delta;
      _puzzData.target.position.x = _puzzData.target._position.x - __delta.x;
      _puzzData.target.position.y = _puzzData.target._position.y - __delta.y;
      (_puzzData.target.group||[]).forEach( function(p){
        p.position.x = p._position.x - __delta.x;
        p.position.y = p._position.y - __delta.y;
      });
    }
    if(__IData.EndTap){
      if(__IData.cancelEndTap){
        __IData.cancelEndTap=false;
      }else{
        __handleEndTap();                           
      }      
    } 
  };

  _states.idle.draw = function(ctx){ __draw(ctx); };  
  
  // =============================================================================================================================================
  // 
  //  leave
  // 
  // =============================================================================================================================================
  _states.leave.activate = function(o){          
    _fadeControler = new Pol.Core.Game.FadeControler(1000)
                                      .fadeDown( function(){
                                         Pol.Core.Game.EventManager.removeEvent('onPuzzleSuccess');                                         
                                         Pol.Core.Game.StateManager.SetState('Menu');      
                                      });   
  };
  _states.leave.update = function(dt) { 
    _fadeControler.update(dt); 
    _ParticleEmitter.update(dt);
  };
  _states.leave.draw   = function(ctx){
    ctx.globalAlpha = _fadeControler.value/100;
    __draw(ctx);             
    ctx.globalAlpha = 1;    
  };  
  
  // ==================================================================
  //  Buttons handlers
  // ==================================================================
  function __onButtonClick (sender){
    if(sender===_btnNew){
      __initPuzzle();      
    }else if(sender===_btnShow){
      _puzzData.ShowImage = !_puzzData.ShowImage;      
    }else if(sender===_btnRefresh){
      __initPuzzle(true);  
    }else if(sender===_btnBackground){
      //_states.idle.activate();  
    }else if(sender===_btnHome){
      _states.setState('leave');
    }else if(sender===_btnMusic){
      Pol.Core.Game.SoundManager.toggleSoundState();
    }
    _ClapSoundPool.get(.5);    
  }
  // ==================================================================
  //  Common Draw stuff
  // ==================================================================
  function __draw(ctx){  
    Pol.Core.Drawing.ClearShadow();
    ctx.translate(_padding, _padding);
    if(_puzzData){
      __draw_all(ctx)
    }else{
      __draw_buttons(ctx);
    }
    ctx.translate(-_padding, -_padding);
    _ParticleEmitter.draw(ctx); 
  }

  function __draw_buttons(ctx){
    _buttons.forEach( function(b){      
      _buttonsTileSet.draw(ctx, b.ImageIndex, { x : b.x - b.radius, y : b.y - b.radius } );
    }); 
  }
  
  function __draw_panel(ctx){        
    ctx.lineWidth   = 1;
    ctx.strokeStyle = 'rgba(175,175,175,1)';
    Pol.Core.Drawing.SetShadow(10, 10, 25, 'rgba(0, 0, 0, 0.7)'); 
    ctx.fillStyle = 'rgba(25,25,25,1)';
    ctx.fillRect(0, 0, _puzzData.width, _puzzData.height);
    Pol.Core.Drawing.ClearShadow();
      
    if(_puzzData.ShowImage){
      ctx.globalAlpha = 0.15;
      _puzzData.Image.Draw(ctx, 0, 0, _puzzData.Image.width, _puzzData.Image.height, 0, 0, _puzzData.width, _puzzData.height);     
      ctx.globalAlpha = 1.0;
    }
    ctx.strokeRect( 0, 0, _puzzData.width, _puzzData.height);
  }

  function __draw_all(ctx){ 
    // ===================================
    // Buttons
    // ===================================
    __draw_buttons(ctx);
    // ===================================
    // Frame and target image
    // ===================================
    ctx.translate(_puzzData.left, _puzzData.top);
    __draw_panel(ctx);
    ctx.translate(-_puzzData.left, -_puzzData.top);
    // ==================================================================
    // inPlace pieces
    // ==================================================================
    ctx.translate(_puzzData.left, 0);
    ctx.fillStyle   = _puzzData.Pattern;
    ctx.strokeStyle = "white";
    ctx.lineWidth   = 2;    
    Pol.Core.Drawing.ClearShadow();
    _puzzData.pieces
             .where  ( function(p){ return p.isInPlace; })
             .forEach( function(p){      
      p.draw(ctx, p.destination.x, p.destination.y);
      ctx.save();
      ctx.translate(0, _puzzData.top);
      ctx.scale(_puzzData.scale,_puzzData.scale);
      ctx.fill();                         
      ctx.restore();      

      ctx.globalAlpha = 0.35;               
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
    ctx.translate(-_puzzData.left, 0);

    // ==================================================================
    // Not inPlace pieces
    // ==================================================================
    Pol.Core.Drawing.ClearShadow()
    ctx.strokeStyle = "white";
    ctx.lineWidth   = 2;
    var __showShadow = _puzzData.cols *_puzzData.rows < 12     
    _puzzData.pieces
             .where  ( function(p){ return !p.isInPlace; }) 
             .forEach( function(p){
      Pol.Core.Drawing.ClearShadow() 
      if( !p.linked && ( p===_puzzData.target || __showShadow)){
        Pol.Core.Drawing.SetShadow(5, 5, 25, 'rgba(0, 0, 0, 0.7)');
      }                    
      p.draw(ctx, p.position.x, p.position.y);                  
      var __patternOff_x = p.destination.x - p.position.x;
      var __patternOff_y = p.destination.y - p.position.y -_puzzData.top;
      ctx.translate(-__patternOff_x, -__patternOff_y);
      ctx.save();
      ctx.scale(_puzzData.scale,_puzzData.scale);
      ctx.fill();                         
      ctx.restore();
      ctx.translate(__patternOff_x, __patternOff_y);
      ctx.strokeStyle = (p === _puzzData.target || ( _puzzData.target && p.group && p.group===_puzzData.target.group)) ? 'gray' : 'white' ;
      ctx.stroke();                   
    });
  }   

  function __resize(width, height, maxWidth, maxHeight){    
    if(width > maxWidth || height > maxHeight){ 
      var __ratio = width / height
      var __ToWidth = [maxWidth, maxWidth / __ratio];
      var __ToHeight = [maxHeight * __ratio, maxHeight];
      if(__ToWidth[1] > maxHeight) {
        return { width : __ToHeight[0], height :  __ToHeight[1], ratio : width / height, scale : __ToHeight[0]/width };
      }else{ 
        return { width : __ToWidth[0], height :  __ToWidth[1], ratio : width / height, scale :  __ToWidth[0]/width };
      }
    }else{
      return { width : width, height : height, ratio : width / height, scale : 1 };
    }    
  }

  var __initPuzzle = function(refresh){
    _puzzData = _puzzData || {};
    _puzzData.Image = refresh ? _puzzData.Image : Pol.Core.Resources.GetAsset(PuZZGame.Puzzles.Next());
    _puzzData.Pattern = Pol.Core.Game.Context.createPattern(_puzzData.Image, 'no-repeat');
    
    var __info = __resize(_puzzData.Image.width, 
                          _puzzData.Image.height, 
                          Pol.Core.Game.GameWidth * .8, 
                          Pol.Core.Game.GameHeight * .85 );
    _puzzData.width  = __info.width;  
    _puzzData.height = __info.height;
    _puzzData.scale  = __info.scale;
    _puzzData.top    = ((Pol.Core.Game.GameHeight * .85) - _puzzData.height)/2;
    _puzzData.left   = 0;
    _puzzData.Order  = 0;

    var __layout = PuZZGame.Puzzles.RandomLayout();
    _puzzData.cols   = __layout.cols; 
    _puzzData.rows   = __layout.rows;
    _puzzData.status = { total : __layout.cols * __layout.rows, parcial : 0};
    _puzzData.pieceWidth  = (_puzzData.width/_puzzData.cols) | 0;
    _puzzData.pieceHeight = (_puzzData.height/_puzzData.rows) | 0;
    _puzzData.w8          = (_puzzData.pieceWidth/8) | 0;
    _puzzData.h8          = (_puzzData.pieceHeight/8) | 0;
    _puzzData.groups      = {};
    _puzzData.pieces      = [];
    _puzzData.pieceAt     = function(position){
      return _puzzData.pieces.orderBy( function(p){ return -p.zorder; } ).where( function(p){        
        return !p.isInPlace && new Pol.Core.Math.Rect(p.position.x + _padding, p.position.y + _padding, _puzzData.pieceWidth, _puzzData.pieceHeight)
                                                .contains(position);
      })[0];
    }
    _puzzData.sort = function(){
      _puzzData.pieces = _puzzData.pieces.orderBy( function(p){ return p.zorder; } );
    }
    // ====================================================================
    // Init puzzle pieces
    // ====================================================================
    for(var y=0; y<_puzzData.rows; y++){
      for(var x=0; x<_puzzData.cols; x++){
        _puzzData.pieces.add( new Piece(y, x, _puzzData));
      }
    }
    // ====================================================================
    // Set positions
    // ====================================================================
    _puzzData.pieces.forEach( function(p){
      p.position.x = Pol.Core.Math.Random(Pol.Core.Game.GameWidth  - _puzzData.pieceWidth/2  - 40, _puzzData.width + 10); 
      p.position.y = Pol.Core.Math.Random(Pol.Core.Game.GameHeight - _puzzData.pieceHeight - 40, 0);
      p.zorder = Pol.Core.Math.Random(1000, 0);
      _puzzData.Order = Math.max(_puzzData.Order, p.zorder);
      p.neighbors   = __getNeighbors(p.row,p.col,p.connectors);
    })
    _puzzData.sort();
  }

  function __getNeighbors(row, col, info){
    var __res = ['','','',''];
    if(info[0]) __res[0] = _puzzData.pieces[((row-1) * _puzzData.cols) + col]; 
    if(info[1]) __res[1] = _puzzData.pieces[((row) * _puzzData.cols) + col+1]; 
    if(info[2]) __res[2] = _puzzData.pieces[((row+1) * _puzzData.cols) + col]; 
    if(info[3]) __res[3] = _puzzData.pieces[((row) * _puzzData.cols) + col-1];  
    return __res;
  }

  function Piece(row, col, data){
    var __self = this;
    this.id = '{0}-{1}'.format(row, col);
    this.row = row;
    this.col = col;
    this.destination = new Pol.Core.Math.Vector2(col * _puzzData.pieceWidth, (row * _puzzData.pieceHeight)+_puzzData.top);
    this.position    = new Pol.Core.Math.Vector2(col * _puzzData.pieceWidth, row * _puzzData.pieceHeight);
    this.zorder      = 0;
    this.isInPlace   = false;
    this.connectors  = __createConnectors(row, col);    
    this.activate    = function(){ this.zorder = ++_puzzData.Order; }
    this.draw        = function(ctx, x, y){

      ctx.beginPath();
      ctx.moveTo(x , y);
      // Top
      if(__self.connectors[0]!=''){
        ctx.lineTo(x + _puzzData.w8*2, y );
        ctx.arc(x + _puzzData.w8*4, y, _puzzData.w8, Math.PI, 0, __self.connectors[0]=='D');
      }
      ctx.lineTo(x + _puzzData.pieceWidth , y);
      // Right
      if(__self.connectors[1]!=''){
        ctx.lineTo(x + _puzzData.pieceWidth, y + _puzzData.h8*2);
        ctx.arc(x + _puzzData.pieceWidth, y + _puzzData.h8*4, _puzzData.w8, -Math.PI/2, Math.PI/2, __self.connectors[1]=='L');
      }
      ctx.lineTo(x + _puzzData.pieceWidth, y + _puzzData.pieceHeight );
      // Bottom
      if(__self.connectors[2]!=''){
        ctx.lineTo(x + _puzzData.w8*6, y + _puzzData.pieceHeight );
        ctx.arc(x + _puzzData.w8*4, y + _puzzData.pieceHeight, _puzzData.w8, 0, Math.PI, __self.connectors[2]=='U');      
      }
      ctx.lineTo(x, y + _puzzData.pieceHeight);     
      // Left
      if(__self.connectors[3]!=''){
        ctx.lineTo(x, y + _puzzData.h8*6);
        ctx.arc(x, y + _puzzData.h8*4, _puzzData.w8, Math.PI/2, -Math.PI/2, __self.connectors[3]=="L");
        ctx.lineTo(x, y);      
      }
      ctx.closePath();
    }

    return this;  
  }
   
  function __createConnectors(row, col){
    var __info = ['','','',''];
    if(row==0){
      __info[1] = col < _puzzData.cols-1 ? (Pol.Core.Math.Random(10,0)>5 ? 'R' : 'L') : '';
      __info[2] = Pol.Core.Math.Random(10,0)>5 ? 'U' : 'D';
      __info[3] = col>0 ? (_puzzData.pieces.lastItem().connectors[1]=='L' ? 'R' : 'L') : '';
      return __info;
    }
    
    var __top = _puzzData.pieces[((row-1) * _puzzData.cols) + col];
    __info[0] = __top.connectors[2];
    __info[1] = col < _puzzData.cols-1 ? (Pol.Core.Math.Random(10,0)>5 ? 'R' : 'L') : '';
    __info[2] = row < _puzzData.rows-1 ? (Pol.Core.Math.Random(10,0)>5 ? 'U' : 'D') : '';
    __info[3] = col>0 ? (_puzzData.pieces.lastItem().connectors[1]=='L' ? 'R' : 'L'): '';  
    return __info;
  }

  function __onPuzzleSuccess(){
    _puzzData.target = undefined;
    var __center = Pol.Core.Math.Rect.prototype.centerPoint.apply(_puzzData);
    __center.color = 'blue';
    _ParticleEmitter.createParticlesAt( __center, 10);       
    Pol.Core.Game.EventManager.removeEvent('onPuzzleSuccess'); 
    var __e = Pol.Core.Game.EventManager.buildEvent( function(){ 
        _puzzData.left = _puzzData.left || 0;
        _puzzData.left +=3;
        _puzzData.left %= 11;
      }, 55, 35, function(){
        _puzzData.left = 0;
      }
    ); // callback, delay, times, onTerminate;
    Pol.Core.Game.EventManager.addEvent(__e, 'onPuzzleSuccess');
  }

  function __handleEndTap(){

    if(!_puzzData.target) return;   

    var __square_dis = 40 * 40;
    var __resolveCollisions = function(target){
      // ==================================================================================================
      // 1 distance to end piece position
      // ==================================================================================================
      var __distance = Pol.Core.Math.Vector2.distanceSquared( target.destination, target.position); 
      if(__distance < __square_dis) return [4, target.destination.x, target.destination.y];   
      // ==================================================================================================================================
      // 2 distance to neighbors pieces
      // ==================================================================================================================================
      var __offsets    = { x : 0, y : 0 };
      var __DIS        = function(a, b) { var dx = a.x - b.x  + __offsets.x; var dy = a.y - b.y + __offsets.y; return dx * dx + dy * dy; };
      var __NotInTargetGroup =  function(piece) {
        if(!target.group) return true;
        if(!piece.group)  return true;
        return target.group!=piece.group;
      }
      var __neighbors  = target.neighbors;
      // Top
      if(__neighbors[0] && __NotInTargetGroup(__neighbors[0])){    
        __offsets.y = - _puzzData.pieceHeight;
        __distance = __DIS( _puzzData.target.position, __neighbors[0].position); 
        if(__distance < __square_dis) return [0, __neighbors[0].position.x, __neighbors[0].position.y + _puzzData.pieceHeight];                 
      }
      // Right
      if(__neighbors[1] && __NotInTargetGroup(__neighbors[1])){ 
        __offsets.y = 0;
        __offsets.x = _puzzData.pieceWidth;
        __distance = __DIS( _puzzData.target.position, __neighbors[1].position); 
        if(__distance < __square_dis) return [1, __neighbors[1].position.x - _puzzData.pieceWidth, __neighbors[1].position.y];        
      }
      // Bottom
      if(__neighbors[2] && __NotInTargetGroup(__neighbors[2])){       
        __offsets.y = _puzzData.pieceHeight;
        __offsets.x = 0
        __distance = __DIS( _puzzData.target.position, __neighbors[2].position); 
        if(__distance < __square_dis) return [2, __neighbors[2].position.x, __neighbors[2].position.y - _puzzData.pieceHeight]; 
      }
      // Left
      if(__neighbors[3] && __NotInTargetGroup(__neighbors[3])){ 
        __offsets.y = 0;
        __offsets.x = -_puzzData.pieceWidth;
        __distance = __DIS( _puzzData.target.position, __neighbors[3].position); 
        if(__distance < __square_dis) return [3, __neighbors[3].position.x + _puzzData.pieceWidth, __neighbors[3].position.y];       
      } 
      return false;
    }
          
    var __info = __resolveCollisions(_puzzData.target);
    if (__info){
      _ClapSoundPool.get(0.8);
      if(__info[0]==4) {        
        (_puzzData.target.group||[_puzzData.target]).forEach( function(p){
          p.linked = false;         
          p.position = p.destination;
          p.isInPlace = true;
          _puzzData.status.parcial++;          
        });
        _puzzData.target.group = undefined;
      }else{
        var __other = _puzzData.target.neighbors[__info[0]]              
        if(_puzzData.target.linked && __other.linked){
          if (_puzzData.target.group == __other.group) return;          
        }
        var __offx = _puzzData.target.position.x - __info[1]
        var __offy = _puzzData.target.position.y - __info[2]
        if(_puzzData.target.group){
          _puzzData.target.group.forEach( function(p){ 
            p.position.x -= __offx;
            p.position.y -= __offy;
          });
        }else{
          _puzzData.target.position.x = __info[1];
          _puzzData.target.position.y = __info[2];
        }

        _puzzData.target.linked = __other.linked = true;
        if(__other.group){
          if( _puzzData.target.group){            
            _puzzData.target.group.forEach( function(p){ 
              p.group = __other.group;
              __other.group.add(p);
            });            
          }else{
            __other.group.add(_puzzData.target);                           
          }          
          _puzzData.target.group = __other.group;
        }else{
          if(!_puzzData.target.group){ 
            _puzzData.target.group = [_puzzData.target];
          }                      
          _puzzData.target.group.add(__other);
          __other.group =_puzzData.target.group ;
        }   
        _ParticleEmitter.createParticlesAt( { color : 'blue', 
                                              x     : _puzzData.target.position.x + _puzzData.pieceWidth/2, 
                                              y     : _puzzData.target.position.y + _puzzData.pieceHeight/2}, 10);
      }      
      if(_puzzData.status.parcial==_puzzData.status.total){
        Pol.Core.Game.SoundManager.playSound("SUCCESS.Sound");
        __onPuzzleSuccess();
      }
    }        
  }
  
  
  return  _that; 
}();


//ctx.fillStyle = p===_puzzData.target ? '#858585' : '#3E3E3E';
//ctx.fillRect(p.position.x, p.position.y, _puzzData.pieceWidth, _puzzData.pieceHeight);
//ctx.strokeStyle = "#000";
//ctx.fillStyle = "#efefef";
//ctx.strokeRect( p.position.x, p.position.y, _puzzData.pieceWidth, _puzzData.pieceHeight); 
//ctx.textAlign = "center";
//ctx.fillStyle = "black";
//ctx.fillText(p.id.toString(),p.position.x + _puzzData.pieceWidth/2, p.position.y + _puzzData.pieceHeight/2);