
var $ = function(e) { return (e)?document.getElementById(e):document.body; }
$.$   = function(e, o) {
  var x = document.createElement(e);  
  for (var p in o) {
    if (Pol.isObject(x[p]))
      for (var p2 in o[p]) x[p][p2] = o[p][p2];
    else
      x[p] = o[p];
  }
  return x;
}
 
Object.prototype.Create = function(){
  function F(){};
  F.prototype = this;
  return new F();
}
   
var Pol = {  
  $           : $,
  isObject    : function(val) { return val && typeof val == "object"; },
  isArray     : function(val) { return isObject(val) && val.constructor == Array; },
  isString    : function(val) { return typeof val == "string"; },
  isBoolean   : function(val) { return typeof val == "boolean"; },
  isNumber    : function(val) { return typeof val == "number"; },
  isFunction  : function(val) { return typeof val == "function"; },          
  apply       : function(o, c, d) {
    if(d) Pol.apply(o, d);
    if(o && Pol.isObject(c)) for (var p in c) o[p] = c[p];
    return o;
  },
  each        : function(array, fn, scope) {
    if(typeof array.length == "undefined" || typeof array == "string") { array = [array];}
    for (var i=0, len=array.length; i < len; i++) { if (fn.call(scope || array[i], array[i], i, array) === false) { return i; }; }
  },
  getObjectProps: function(obj) {
    var ret = [];
    for (var p in obj) { ret.push(p); }
    return ret;
  },
  addEvent : function(o,name,fn){
    if(o.addEventListener) o.addEventListener(name,fn,false);
  }, 
  clone : function(obj) {
    if (Pol.isObject(obj) || Pol.isArray(obj)) {
      if (obj.clone) return obj.clone();    
      var clone = Pol.isArray(obj) ? [] : {};
      for (var key in obj) {
        clone[key] = Pol.clone(obj[key]);
      }
      return clone;
    }
    return obj;
  },
  createNamespace : function(name, opt_object) {  
    var cur = opt_object || Pol;
    var parts = name.split('.');
    if (!(parts[0] in cur) && cur.execScript) {
      cur.execScript('var ' + parts[0]);
    }
    for (var part; parts.length && (part = parts.shift());) {
      if (cur[part]) {
        cur = cur[part];
      } else {
        cur = cur[part] = {};
      }
    }
    return Pol.createNamespace;
  },
  serie : function(items){
    var that = { 
      values : items,       
      next   : function() {
        that.current = (that.current < this.values.length-1) ?  ++that.current : 0 ;
        return this.values[that.current];
      },
      nextRandom: function() {        
        that.current =  Math.floor( (Math.random() * this.values.length+1)-1);
        return this.values[that.current];
      },
      current : 0
    }
    return that;
  },
  floatIsZero : function(a){
    return Math.abs(a - 0.0) < 0.0000001;
  },
  floatEqual : function(a,b){
    return Math.abs(a - b) < 0.0000001;
  }     
};

Pol.apply(String.prototype, {
  replaceAll: function(pattern, replacement) { return this.split(pattern).join(replacement); },
  contains: function(t) { return this.indexOf(t) >= 0; },
  beginsWith: function(t, i) { if (i == false) { return (t == this.substring(0, t.length)); } else { return (t.toLowerCase() == this.substring(0, t.length).toLowerCase()); } },
  endsWith: function(t, i) { if (i == false) { return (t == this.substring(this.length - t.length)); } else { return (t.toLowerCase() == this.substring(this.length - t.length).toLowerCase()); } },
  left: function(length) { return this.substring(0, length); },
  right: function(length) { return this.substring(this.length - length, this.length); },
  ltrim: function() { return this.replace(/^\s+/, ''); },
  rtrim: function() { return this.replace(/\s+$/, ''); },
  trim: function() { return this.rtrim().ltrim(); }, 
  format: function() {
    var args = arguments;     
    return this.replace(/\{(\d+)\}/g, function(m, i) { return args[i]; });
  },
  paddingLeft : function (paddingValue) {
    return (paddingValue + this).slice(-paddingValue.length);
  }
});

Pol.apply(Array.prototype, {
  forEach : Array.prototype.forEach || function(fn, thisObj) {
    var scope = thisObj || window;
    for (var i = 0, j = this.length; i < j; ++i) {
      fn.call(scope, this[i], i, this);
    }
  },
  map : Array.prototype.map || function(fn, thisObj) {
    var scope = thisObj || window;
    var a = [];
    for (var i = 0, j = this.length; i < j; ++i) {
      a.push(fn.call(scope, this[i], i, this));
    }
    return a;
  },
  filter: function(fn, thisObj) {
    var scope = thisObj || window;
    var a = [];
    for (var i = 0, j = this.length; i < j; ++i) {
      if (!fn.call(scope, this[i], i, this)) continue;
      a.push(this[i]);
    }
    return a;
  },
  indexOf : Array.prototype.indexOf || function(el, start) {
    var start = start || 0;
    for (var i = start; i < this.length; ++i) {
      if (this[i] === el) return i;
    }
    return -1;
  },
  lastIndexOf : Array.prototype.lastIndexOf || function(el, start) {
    var start = start || this.length;
    if (start >= this.length) start = this.length;
    if (start < 0) start = this.length + start;
    for (var i = start; i >= 0; --i) {
      if (this[i] === el) return i;
    }
    return -1;
  },
  remove: function(o) {
    var index = this.indexOf(o);
    if (index != -1) this.splice(index, 1);
  },
  add: function(o) {
    this[this.length] = o;
    return o;
  },
  lastItem: function() { return this[this.length - 1] },
  select  : function(sentence){ return this.map(sentence) },   
  where   : function(sentence){ return this.filter(sentence) },
  orderBy : function(sentence){    
    return this.map(function(e){return e})
               .sort(function(a, b){
                  var x = sentence(a);
                  var y = sentence(b);
                  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });     
  },
  item : function(propName,value){ return this.where( function(__I){return __I[propName] == value})[0] },
  contains : function(propName,value){return this.item(propName,value)}
    
});


Pol.createNamespace('Core.Event')
                   ('Core.Game')
                   ('Core.Resources')
                   ('Core.Math');

// ==================================================================================================== 
//
// Pol.Core.Event
//
// ====================================================================================================
Pol.Core.Event = function(name){  
  var _subscribers = {};
  var _lastUid     = 0;
  var _that        = { Name      : name, 
                       Dispatch  : function(eventArgs){
                                  for(var m in _subscribers){
                                    if(_subscribers.hasOwnProperty(m)){
                                       _subscribers[m](name, eventArgs||{});
                                    }
                                  }
                                  return _that;
                       },
                       Add    : function (callback){
                                  var id = (++_lastUid).toString();
                                  _subscribers[id] = callback;                                      
                                  return id;
                       },
                       Remove : function (id){                                  
                                  if ( _subscribers.hasOwnProperty(id) ) {
                                    delete _subscribers[id];
                                    return true;
                                  }
                                  return false;
                      }};                
  return _that;
}


// ==================================================================================================== 
//
// Pol.Core.State
//
// ====================================================================================================
Pol.Core.StateManager = function(){
  var _that = {
    state    : {},
    enter    : {},
    idle     : {},
    leave    : {},
    setState : function(name,o){
      _that.state = _that[name];  
      _that.state.activate(o);}    
  }
  return _that;
}

// ==================================================================================================== 
//
// Pol.Core.Resources
//
// ====================================================================================================
Pol.Core.Resources = function(){

  var _that = { TYPES  : { IMAGE : 1, AUDIO : 2, TXT : 3},
                Events : { OnError   : new Pol.Core.Event('Pol.Core.Resources.Error'),
                           OnReady   : new Pol.Core.Event('Pol.Core.Resources.Ready'),
                           OnLoaded  : new Pol.Core.Event('Pol.Core.Resources.Loaded') }  
  };
  var _assets            = {};
  var _loadStatus        = {};
  var _extension_to_type = { png : 1, bmp  : 1, gif : 1, jpg : 1, jpeg : 1,
                             wav : 2, webm : 2, ogg : 2, mp3 : 2, aac  : 2,
                             txt : 3 };

  function _assetTypeFromFilename(fileName) {
    var segs = fileName.split('.');
    var ext = segs[segs.length-1];
    return _extension_to_type[ext.toLowerCase()] || _that.TYPES.IMAGE;
  }

  function _createLoadCallback(assetName) {
    return function() {
      _loadStatus[assetName] = true;
      _that.Events.OnLoaded.Dispatch({ Message : assetName });
      if (_that.Ready()) _that.Events.OnReady.Dispatch({ Message : 'Resources loaded' });      
    }
  }

  function _createErrorCallback(assetName) {
    return function() {
      _loadStatus[assetName] = true;
      _loadStatus[assetName].error = true;
      _that.Events.OnError.Dispatch({ Message : 'Asset "{0}" could not be loaded'.format(assetName) });
    }
  }

  _that.AddAsset = function(name, src) {
    if (name in _assets) {
      _that.Events.OnError.Dispatch({ Message : 'Asset "{0}" is already in the cache'.format(name) });
      return;
    } 
     _loadStatus[name] = false;
    var assetType = _assetTypeFromFilename(src);
    switch (assetType) {
        case _that.TYPES.IMAGE:
          _assets[name] = new Image();
          Pol.addEvent(_assets[name], 'load', _createLoadCallback(name));
          Pol.addEvent(_assets[name], 'error', _createErrorCallback(name));
          break;
        case _that.TYPES.AUDIO:
          _assets[name] = new Audio();
          Pol.addEvent(_assets[name], 'canplaythrough', _createLoadCallback(name));
          Pol.addEvent(_assets[name], 'error', _createErrorCallback(name));
          break; 
        default:
          _that.Events.OnError.Dispatch({ Message : 'Asset {0} {1} not supported.'.format(name, src) });
          break;
    }
    _assets[name].src = src;
    return _that;
  }     
  
  _that.HasAsset  = function HasAsset(name) { return _loadStatus[name] && (name in _assets); }
  _that.GetAsset  = function (name) {
    if (_assets[name]) {
      return _assets[name];
    }else {
      _events.OnError.Dispatch( { Name : name, Message : 'Asset "{0}" not found in cache'.format(name) });
      return null;
    }
  }

  _that.Ready = function(){
    for(var id in _assets){
      if(!_loadStatus[id]) return false;
    }
    return true;
  }
 
  _that.Completion = function(){
    var total=0, loadCount=0;
    for (var id in _assets) {
      total++;
      if(id in _loadStatus){ if(_loadStatus[id]) loadCount++; }
    }
    return total ? loadCount / total : 0;
  }
  
  return _that;
}()

Pol.apply(Image.prototype, {
  Draw : function(ctx,sx, sy, sw, sh, dx, dy, dw, dh){  
            ctx.drawImage(this,sx, sy, sw, sh, dx, dy, dw, dh);
            return this;
  },
  centerPoint : function(){ return new Pol.Core.Math.Vector2( this.width >> 1, this.height >> 1);}
});
