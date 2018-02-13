
this.JSON = this.JSON || {}
this.JSON.parse = this.JSON.parse || function(expr) { return eval('(' + expr + ')');}
this.JSON.tryParse = function(expr){ try { return JSON.parse(expr); } catch (er) { return { Resultado : 'Error', Mensaje : er.message};}; }

Object.prototype.Create = function(){
  function F(){};
  F.prototype = this;
  return new F();
}
$ = function(e) { return (e) ? MAPA.getDom(e) : document.body; };
$.New = function(element, o) {
  var x = document.createElement(element);
  x.Add = function(child, op) {
    if (MAPA.isString(child))
      this.appendChild(this.New(child, op))
    else
      this.appendChild(child);
    return this
  };
  x.Clear = function() { this.innerHTML = ''; return this };
  x.Remove = function(child) { this.removeChild(child); return this };
  x.RemoveMe = function() { var p = this.parentNode; p.removeChild(this); return p };
  x.New = $.New
  for (var p in o) {
    if (MAPA.isObject(x[p]))
      for (var p2 in o[p]) x[p][p2] = o[p][p2];
    else
      x[p] = o[p];
  }
  return x;
}
$.$ = function(element, o) {
  var x = document.createElement(element);  
  for (var p in o) {
    if (MAPA.isObject(x[p]))
      for (var p2 in o[p]) x[p][p2] = o[p][p2];
    else
      x[p] = o[p];
  }
  return x;
}
$.Hide = function(e){
  MAPA.getDom(e).style.display = 'none';
  return $;
}
$.Show = function(e){
  if (arguments.length>1 && !arguments[1]){
    $.Hide(e);
    return $;
  }
  MAPA.getDom(e).style.display = '';
  return $;
}

MAPA = {};

MAPA.apply = function(o, c, defaults) {
  if (defaults) MAPA.apply(o, defaults);
  if (o && c && typeof c == 'object') for (var p in c) o[p] = c[p];
  return o;
};

(function() {
  var ua = navigator.userAgent.toLowerCase();
  var isOpera = ua.indexOf("opera") > -1;
  var isSafari = (/webkit|khtml/).test(ua);
  var isSafari3 = isSafari && ua.indexOf('webkit/5') != -1;
  var isGecko = !isSafari && ua.indexOf("gecko") > -1
  var isIE = ua.indexOf("msie") > -1;
  var isIE6 = ua.indexOf("msie 6") > -1;
  var isIE7 = ua.indexOf("msie 7") > -1;
  var isIE8 = ua.indexOf("msie 8") > -1;
  var isIE9 = ua.indexOf("msie 9") > -1;
 
  MAPA.apply(MAPA, {
    Pos: { X: 0, Y: 0 },
    ___Move: function(ev) {
      ev = MAPA.MapaEvent(ev)
      MAPA.Pos.X = ev.Event.clientX;
      MAPA.Pos.Y = ev.Event.clientY;
      if(MAPA.OnMouseMove) MAPA.OnMouseMove(MAPA.Pos)  
    },
    ___Pos: function(ev) {
      ev = MAPA.MapaEvent(ev)
      MAPA.Pos.X = ev.Event.clientX;
      MAPA.Pos.Y = ev.Event.clientY;
      if(MAPA.OnMouseUp) MAPA.OnMouseUp(MAPA.Pos)     
    },
    isReady: false,
    emptyFn: function() { },
    applyIf: function(o, c) {
      if (o && c) {
        for (var p in c) {
          if (typeof o[p] == "undefined") { o[p] = c[p]; }
        }
      }
      return o;
    },
    each: function(array, fn, scope) {
      if (typeof array.length == "undefined" || typeof array == "string") {
        array = [array];
      }
      for (var i = 0, len = array.length; i < len; i++) {
        if (fn.call(scope || array[i], array[i], i, array) === false) { return i; };
      }
    },
    toArray: function(o) {
      var items = [];
      MAPA.each(o, function(e) { items.push(e) });
      return items;
    },
    namespace: function() {
      var a = arguments, o = null, i, j, d, rt;
      for (i = 0; i < a.length; ++i) {
        d = a[i].split(".");
        rt = d[0];
        eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
        for (j = 1; j < d.length; ++j) {
          o[d[j]] = o[d[j]] || {};
          o = o[d[j]];
        }
      }
    },
    escapeRe: function(s) {
      return s.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1");
    },
    GetCssRule: function(ruleName) {
      var __rules = document.styleSheets[0]
      var __rules = __rules.cssRules ? MAPA.toArray(__rules.cssRules) : MAPA.toArray(__rules.rules);
      return __rules.Where(function(rule) { return rule.selectorText == ruleName; })[0];
    },  
    callback: function(cb, scope, args, delay) {
      if (typeof cb == "function") {
        if (delay) {
          cb.defer(delay, scope, args || []);
        } else {
          cb.apply(scope, args || []);
        }
      }
    },
    getDom: function(el) {
      if (!el) {
        return null;
      }
      return el.dom ? el.dom : (typeof el == 'string' ? document.getElementById(el) : el);
    },
    floatToString : function(v){
      var __v = (v+'').split('.');
      return __v[0].replace(/.(?=(?:.{3})+$)/g, '$&.') + ',' + (__v[1]||'00');

    },        
    FormatNumberEsp: function(number, dec, miles) {
      var Tempo = MAPA.numFormat(number, dec, miles);
      Tempo = Tempo.replaceAll('.', 'X');
      Tempo = Tempo.replaceAll(',', '.');
      Tempo = Tempo.replaceAll('X', ',');
      if (dec == 0) { Tempo = Tempo.replaceAll(',', ''); };
      return Tempo;
    },
    ParseFloat: function(txt, msg) {
      if(!/^([0-9])*[,]?[0-9]*$/.test(txt.value.replaceAll('.',''))) throw new Error(msg);            
      var __valor = parseFloat(txt.value.toFloat());
      if (isNaN(__valor)) throw new Error(msg);
      txt.value = MAPA.FormatNumberEsp(__valor, txt.__decimalPositions || 2, true);
      return __valor;        
    },
    numFormat: function(number, dec, miles) {
      var num = number, signo = 3, expr;
      var cad = "" + number;
      var ceros = "", pos, pdec, i;
      for (i = 0; i < dec; i++)
        ceros += '0';
      pos = cad.indexOf('.')
      if (pos < 0)
        cad = cad + "." + ceros;
      else {
        pdec = cad.length - pos - 1;
        if (pdec <= dec) {
          for (i = 0; i < (dec - pdec); i++)
            cad += '0';
        }
        else {
          num = num * Math.pow(10, dec);
          num = Math.round(num);
          num = num / Math.pow(10, dec);
          cad = new String(num);
        }
      }
      pos = cad.indexOf('.')
      if (pos < 0) pos = cad.lentgh
      if (cad.substr(0, 1) == '-' || cad.substr(0, 1) == '+')
        signo = 4;
      if (miles && pos > signo)
        do {
        expr = /([+-]?\d)(\d{3}[\.\,]\d*)/
        cad.match(expr)
        cad = cad.replace(expr, RegExp.$1 + ',' + RegExp.$2)
      }
      while (cad.indexOf(',') > signo)
      if (dec < 0) cad = cad.replace(/\./, '')
      return cad;
    },
    num: function(v, defaultValue) {
      if (typeof v != 'number') return defaultValue;
      return v;
    },
    NaN: function(value, defaultValue) {
      var r = MAPA.num(parseInt(value), defaultValue);
      return (r.toString() == 'NaN') ? defaultValue : r;
    },
    AddEvent: function(e, name, fn) {
      if (document.addEventListener) {
        e.addEventListener(name, fn, false);
      }
      else {
        e.attachEvent('on' + name, fn);
      }
    },
    RemoveEvent: function(e, name, fn) {
      if (document.removeEventListener) {
        e.removeEventListener(name, fn, false);
      }
      else {
        e.detachEvent('on' + name, fn);
      }
    },
    isEmpty: function(v, allowBlank) {
      return v === null || v === undefined || (!allowBlank ? v === '' : false);
    },
    cancelEvent: function NocCheck(event) {
      var e = event || window.event;
      e.cancelBubble = true;
      e.returnValue = false;
      if (e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
      return false;
    },
    cancelBubble: function NocCheck(event) {
      var e = event || window.event;
      e.cancelBubble = true;
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      return true;
    },
    MapaEvent: function(ev) {
      var __ev = ev || window.event;
      var t = __ev.target || __ev.srcElement;
      return { Event: __ev,
        Target: t
      };

    },
    DateTextBox: function(e) {
      MAPA.AddEvent(e, 'mousemove', function(ev) {
        var offset = MAPA.DragHelper.prototype.getMouseOffset(e, ev);
        if ((offset.x < 15) && (offset.y < 15)) {
          e.style.cursor = 'pointer';
          return;
        }
        e.style.cursor = '';
      })
      MAPA.AddEvent(e, 'keydown', function(ev) {
        var _ev = MAPA.MapaEvent(ev).Event;
        // Ctrl + Enter -> Fecha actual
        if (_ev.ctrlKey && _ev.keyCode == 13) {
          var D = new Date();
          e.value = String.format("{0}/{1}/{2}",
                                   D.getDate(),
                                   String.leftPad(D.getMonth() + 1, 2, '0'),
                                   D.getFullYear());
          return MAPA.cancelEvent(_ev);
        }
        // Tecla Abajo. abrir el calendario si no está abierto
        if (_ev.keyCode == 40 && !(document.__Calendar && document.__Calendar.__Loc && document.__Calendar.__Loc.IsVisible()))
          OnClick(e);

        // Tecla Arriba. Cerrar el calendario. Si está mostrado.
        if (_ev.keyCode == 38 && document.__Calendar && document.__Calendar.__Loc && document.__Calendar.__Loc.IsVisible())
          document.__Calendar.__Loc.Hide();
      })
      var OnClick = function(ev) {

        var offset = MAPA.DragHelper.prototype.getMouseOffset(e, ev);


        if ((offset.x > 15) || (offset.y > 15)) return;
        if (!document.__Calendar) {
          document.__Calendar = new MAPA.Calendar({ month: new Date().getMonth(), year: new Date().getFullYear() });
          document.__DH = document.__DH || new MAPA.DragHelper();
          document.__DH.MakeDragable(document.__Calendar.Element,
                                     new MAPA.RECT({ bottom: 11 })
                                    );
        }
        document.__Calendar.OnClick = function(sender, cell) {
          // Establecer la fecha en la caja de texto
          e.value = cell.Date.Format();
          sender.__Loc.Hide();
          e.focus();
        };
        // preguntar si está mostrado para ocultar.
        if (document.__Calendar && document.__Calendar.__Loc && document.__Calendar.__Loc.IsVisible()) {
          if (document.__Calendar.__Loc.RefControl.id == e.id) {
            document.__Calendar.__Loc.Hide();
            return MAPA.cancelEvent(ev);
          }
        }
        // Establecer la fecha del calendario.
        document.__Calendar.SetDate(e.value)
        document.__Calendar.__Loc = new MAPA.LocatorControl({ TargetControl: document.__Calendar.Element, RefControl: e })
        document.__Calendar.__Loc.Show();

        return MAPA.cancelEvent(ev);
      }
      MAPA.AddEvent(e, 'mousedown', OnClick)
      e.className = ' txtCalendar';
      return MAPA.DateTextBox;
    },
    OnCtrlKeyPress: function(keyCode, fn) {
      var KeyLink = function(_keyCode, _fn) {
        this.EventHandler = function(ev) {
          var _ev = MAPA.MapaEvent(ev).Event;
          // Ctrl + Codigo De Tecla 
          //Debug.WriteLine(_ev.keyCode)                                     
          if (_ev.ctrlKey && _ev.keyCode == _keyCode) {
            _fn();
            return MAPA.cancelEvent(_ev);
          }
        }
      }
      var Handler = new KeyLink(keyCode, fn)
      MAPA.AddEvent(document, 'keydown', Handler.EventHandler)
      return Handler;
    },
    RECT: function(o) {
      if (o) MAPA.apply(this, o);
      this.top = this.top || 0;
      this.right = this.right || 0;
      this.left = this.left || 0;
      this.bottom = this.bottom || 0;
    },
    GetScrollY: function() {
      if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop || 0;
      if (document.body && document.body.scrollTop) return document.body.scrollTop || 0;
      return (window.pageYOffset) ? window.pageYOffset || 0 : window.scrollY || 0;
    },
    GetScrollX: function() {
      if (document.documentElement && document.documentElement.scrollLeft) return document.documentElement.scrollLeft || 0;
      if (document.body && document.body.scrollLeft) return document.body.scrollLeft || 0;
      return (window.pageXOffset) ? window.pageXOffset || 0 : window.scrollX || 0;
    },
    GetScrollPositions : function  () {
      if ('pageXOffset' in window) return { x : window.pageXOffset, y : window.pageYOffset};
      var zoomFactor = (function(){
        if (document.body.getBoundingClientRect) {                    
          var rect = document.body.getBoundingClientRect();
          var physicalW = rect.right - rect.left;
          var logicalW = document.body.offsetWidth;                    
          return Math.round ((physicalW / logicalW) * 100) / 100;
        }
        return 1;            
      })();           
      return { x : Math.round (document.documentElement.scrollLeft / zoomFactor), 
               y : Math.round (document.documentElement.scrollTop / zoomFactor)};             
    },            
    isNull: function(val) { return val === null; },
    isArray: function(val) { return isObject(val) && val.constructor == Array; },
    isString: function(val) { return typeof val == "string"; },
    isBoolean: function(val) { return typeof val == "boolean"; },
    isNumber: function(val) { return typeof val == "number"; },
    isFunction: function(val) { return typeof val == "function"; },
    isObject: function(val) { return val && typeof val == "object"; },
    getObjectProps: function(obj) {
      var ret = [];
      for (var p in obj) { ret.push(p); }
      return ret;
    },
    SetOpacity: function(element, value) {
      element.style.opacity = value;
      element.style.filter = String.format('alpha(opacity={0})', parseInt(parseFloat(value) * 100));
    },
    clone : function(obj) {
      if (MAPA.isObject(obj) || MAPA.isArray(obj)) {
        if (obj.clone) return obj.clone();    
        var clone = MAPA.isArray(obj) ? [] : {};
        for (var key in obj) {
          clone[key] = MAPA.clone(obj[key]);
        }
        return clone;
      }
      return obj;
    },
    createNamespace : function(name, opt_object) {  
      var cur = opt_object || MAPA;
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
      return MAPA.createNamespace;
    },
    Serie : function(items){
      var that = { 
        values : items,       
        Next   : function() {
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
    CreateOption : function(key,text){
      var option = new Option(key,text);
      option.value = key;
      option.innerHTML = text;      
      return option;
    },
    AppendOption : function(combo,key,text){
      combo.appendChild( MAPA.CreateOption(key, text));
      return combo;
    },
    GetSelectedText : function(combo){
      return combo.options[combo.selectedIndex].text;
    }, 
    InnerText : function(e){
      return (e.textContent || e.innerText) || ''; 
    }, 
    Join : function(items, prop, separator){
      var __ids = [];     
      items.forEach( function(item) { __ids.add(item[prop]); });
      return __ids.join(separator || '-');  
    },
    GetCheckInfo : function (){
      var __return = { Items : MAPA.toArray($('TableContainer').getElementsByTagName('input')).Where(function(e){return (e.type == 'checkbox' && e.checked)}), 
                       Ids   : '' };
      __return.Items.forEach( function(e,i){ __return.Ids += e.id.split('-')[1]; __return.Ids += (i<__return.Items.length-1) ? ',' : ''}); 
      return __return;
    },
    ThrowIfEmpty : function(c,message) { if($(c).value.trim().length==0) throw new Error(message); return MAPA.ThrowIfEmpty},
    ThrowIf      : function(c,message) { if(c) throw new Error(message);},
    isOpera: isOpera,
    isSafari: isSafari,
    isSafari3: isSafari3,
    isGecko: isGecko,
    isIE: isIE,
    isIE6: isIE6,
    isIE7: isIE7,
    isIE8: isIE8,
    isIE9: isIE9,

    DEFAULT_LOADING_IMG: 'img/loading.gif',
    DEFAULT_CHECK_IMG: 'img/check.gif',
    DEFAULT_UNCHECK_IMG: 'img/uncheck.gif'
  });
})();


MAPA.DocManager = function() {
  this.OnDocumentReady = MAPA.emptyFn;
  var docReadyProcId;
  var docReadyState = false;

  var fireDocReady = function() {
    if (!docReadyState) {
      docReadyState = true;
      MAPA.isReady = true;
      if (docReadyProcId) {
        clearInterval(docReadyProcId);
      }
      if (MAPA.isGecko || MAPA.isOpera) {
        document.removeEventListener("DOMContentLoaded", fireDocReady, false);
      }
      if (MAPA.isIE) {
        var defer = document.getElementById("ie-deferred-loader");
        if (defer) {
          defer.onreadystatechange = null;
          defer.parentNode.removeChild(defer);
        }
        try {
          document.execCommand("BackgroundImageCache", false, true)
        } catch (e) { }
      }
      MAPA.AddEvent(document, 'mouseup', MAPA.___Pos);
      //MAPA.AddEvent(document, 'mousemove', MAPA.___Move);
      $.Body = document.body;
      document.__DH = new MAPA.DragHelper();
      MAPA.DocManager.OnDocumentReady()
    }
  };

  var initDocReady = function() {
    if (MAPA.isGecko || MAPA.isOpera) {
      document.addEventListener("DOMContentLoaded", fireDocReady, false);
    } else if (MAPA.isIE) {
      document.write("<s" + 'cript id="ie-deferred-loader" defer="defer" src="/' + '/:"></s' + "cript>");
      var defer = document.getElementById("ie-deferred-loader");
      defer.onreadystatechange = function() {
        if (this.readyState == "complete") {
          fireDocReady();
        }
      };
    } else if (MAPA.isSafari) {
      docReadyProcId = setInterval(function() {
        var rs = document.readyState;
        if (rs == "complete") fireDocReady();
      }, 10);
    }
    MAPA.AddEvent(document, 'load', fireDocReady);
  };
  initDocReady();
  return this;
} ();

MAPA.applyIf(String, {
  escape: function(string) {
    return string.replace(/('|\\)/g, "\\$1");
  },
  leftPad: function(val, size, ch) {
    var result = new String(val);
    if (ch === null || ch === undefined || ch === '') {
      ch = " ";
    }
    while (result.length < size) {
      result = ch + result;
    }
    return result;
  },
  format: function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/\{(\d+)\}/g, function(m, i) {
      return args[i];
    });
  },
  addValue: function(s, newValue) {
    var o = s.split(' ');
    return o.indexOf(newValue) == -1 ? s + ' ' + newValue : s;
  },
  removeValue: function(s, value) {
    var o = s.split(' ');
    o.remove(value);
    return o.join(' ');
  },
  isEmpty: function(o) { return !(o || ''); }
});

MAPA.applyIf(String.prototype, {
  toggle: function(value, other) { return (this == value) ? other : value; },
  repeat: function(a) { return new Array(a + 1).join(this); },
  replaceAll: function(pattern, replacement) { return this.split(pattern).join(replacement); },
  contains: function(t) { return this.indexOf(t) >= 0; },
  beginsWith: function(t, i) { if (i == false) { return (t == this.substring(0, t.length)); } else { return (t.toLowerCase() == this.substring(0, t.length).toLowerCase()); } },
  endsWith: function(t, i) { if (i == false) { return (t == this.substring(this.length - t.length)); } else { return (t.toLowerCase() == this.substring(this.length - t.length).toLowerCase()); } },
  addValue: function(value) { var o = this.split(' '); return o.indexOf(value) == -1 ? o.join(' ') + ' ' + value : o.join(' '); },
  removeValue: function(value) { var o = this.split(' '); o.remove(value); return o.join(' '); },
  left: function(length) { return this.substring(0, length); },
  right: function(length) { return this.substring(this.length - length, this.length); },
  ltrim: function() { return this.replace(/^\s+/, ''); },
  rtrim: function() { return this.replace(/\s+$/, ''); },
  trim: function() { return this.rtrim().ltrim(); },
  toFloat: function() { return this.trim().replaceAll('.', '').replaceAll(',', '.') },
  fixDate: function() { return this.split(' ')[0]; },
  fixTime: function() { return this.split(' ')[1]; },
  trimSeconds: function() { return this.split(':')[0] + ':' + this.split(':')[1] ; },
  format: function() {
    var args = arguments;     
    return this.replace(/\{(\d+)\}/g, function(m, i) { return args[i]; });
  },
  paddingLeft : function (paddingValue) {
    return (paddingValue + this).slice(-paddingValue.length);
  }
});

MAPA.applyIf(Array.prototype, {
  forEach: Array.prototype.forEach || function(fn, thisObj) {
    var scope = thisObj || window;
    for (var i = 0, j = this.length; i < j; ++i) {
      fn.call(scope, this[i], i, this);
    }
  },
  every: function(fn, thisObj) {
    var scope = thisObj || window;
    for (var i = 0, j = this.length; i < j; ++i) {
      if (!fn.call(scope, this[i], i, this)) {
        return false;
      }
    }
    return true;
  },
  some: function(fn, thisObj) {
    var scope = thisObj || window;
    for (var i = 0, j = this.length; i < j; ++i) {
      if (fn.call(scope, this[i], i, this)) {
        return true;
      }
    }
    return false;
  },
  map: Array.prototype.map || function(fn, thisObj) {
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
  indexOf: Array.prototype.indexOf || function(el, start) {
    var start = start || 0;
    for (var i = start; i < this.length; ++i) {
      if (this[i] === el) return i;
    }
    return -1;
  },
  lastIndexOf: Array.prototype.lastIndexOf || function(el, start) {
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
  // Like LINQ
  Select  : function(sentence){ return this.map(sentence) },     
  Where   : function(sentence){ return this.filter(sentence) },
  SortBy  : function(propname,desc){
    var __order = [];
    var __names = propname.split(',').map( function(token,i){ 
      var __pair = token.split(' ');
      __order[i] = (__pair[1] && (__pair[1].toUpperCase()=='DESC')) ? -1 : 1;      
      return __pair[0];    
    });
    __order[0] = (desc ? -1 : 1)
    var __len   = __names.length;
    this.sort(function(a, b){
                var i = 0;                 
                var __fn = function(a, b){
                  var __x = a[__names[i]];
                  var __y = b[__names[i]];
                  if(__x < __y) return -1 * __order[i];
                  if(__x > __y) return  1 * __order[i];
                  i++;
                  if(i<__len) return __fn(a,b);       
                  return 0;               
                }
                return __fn(a,b);                                  
              });
    return this;    
  },
  OrderBy : function(sentence){    
    return this.map(function(e){return e})
               .sort(function(a, b){
                  var x = sentence(a);
                  var y = sentence(b);
                  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });     
  },
  OrderByDesc : function(sentence){    
    return this.map(function(e){return e})
               .sort(function(a, b){
                  var y = sentence(a);
                  var x = sentence(b);
                  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });     
  },
  Item : function(propName,value,def){
    if(arguments==1) return this.Where( function(__I){return __I['id'] == propName})[0] || def;
    return this.Where( function(__I){return __I[propName] == value})[0] || def;
  },
  Contains : function(propName,value){
    return this.Item(propName,value)
  },
  Distinct : function(selector) {
    var __result = [];
    this.forEach( function(item){
      var __value = selector(item);
      if(__result.indexOf(__value)==-1) __result.push(__value)
    });
    return __result;
  }
    
});

var From = function (array){return array};

MAPA.apply(Function.prototype, {
  createCallback: function() {
    var args = arguments;
    var method = this;
    return function() { return method.apply(window, args); };
  },
  createDelegate: function(obj, args, appendArgs) {
    var method = this;
    return function() {
      var callArgs = args || arguments;
      if (appendArgs === true) {
        callArgs = Array.prototype.slice.call(arguments, 0);
        callArgs = callArgs.concat(args);
      } else if (typeof appendArgs == "number") {
        callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
        var applyArgs = [appendArgs, 0].concat(args); 		    // create method call params
        Array.prototype.splice.apply(callArgs, applyArgs); 	// splice them in
      }
      return method.apply(obj || window, callArgs);
    };
  },
  defer: function(millis, obj, args, appendArgs) {
    var fn = this.createDelegate(obj, args, appendArgs);
    if (millis) {
      return setTimeout(fn, millis);
    }
    fn();
    return 0;
  }

});

$MC = {};
MAPA.apply($MC, {
  On: function(sender) { sender.className = 'On'; },
  Off: function(sender) {
    sender.className = 'Off';
    if (sender.getAttribute('selected') == 'True') sender.className += ' current'
  },
  Click: function(sender) { alert(sender.id); }
});

$Ajax = {};
MAPA.apply($Ajax, {
  Get: function(url, callBack) {

    url += (url.contains('?') ? '&ms=' : '?ms=') + new Date().getTime();

    var xml = this.CreateXMLHttpRequest();
    xml.open("GET", url, true);
    xml.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
    xml.setRequestHeader('Cache-Control', 'no-cache');
    xml.onreadystatechange = function() { if (xml.readyState == 4) callBack(xml.responseText) };
    xml.send(null);
  },
  Post: function(url, params, callBack) {

    var _params = ((params.tagName || '') == 'FORM') ? this.Serialize(params) : params;
    //alert( _params);                               
    var xml = this.CreateXMLHttpRequest();
    xml.open("POST", url, true);
    xml.onreadystatechange = function() { if (xml.readyState == 4) callBack(xml.responseText) };
    xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset:ISO-8859-1");
    xml.send(_params);
  },
  CallWebMethod: function(url, params, callBack) {
    var xml = this.CreateXMLHttpRequest();
    xml.open("POST", url, true);
    xml.onreadystatechange = function() { if (xml.readyState == 4) callBack(xml.responseText) };
    xml.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xml.send(params);
  },
  colectaElementos: function(a, f) {
    var n = [];
    for (var i = 0; i < a.length; i++) {
      var v = f(a[i]);
      if (v != null) n.push(v)
    }
    return n;
  },
  Serialize: function(f) {
    var GetTags = function(n) { return f.getElementsByTagName(n) };
    var NombreValor = function(e) { return e.id ? String.format('{0}={1}', e.id, encodeURIComponent(e.value.trim())) : '' };
    var i = this.colectaElementos(GetTags('input'), function(i) {
      if (i.type == 'hidden' || i.type == 'button') return null;
      if ((i.type != 'radio' && i.type != 'checkbox') || i.checked)
        return NombreValor(i)
    });
    var s = this.colectaElementos(GetTags('select'), NombreValor);
    var t = this.colectaElementos(GetTags('textarea'), NombreValor);
    return i.concat(s).concat(t).join('&');
  },
  CreateXMLHttpRequest: function() { return (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest(); }
});

MAPA.TablePageRenderize = function(options) {

  MAPA.apply(this, options);
  var me = this;

  this.PaginaAct = this.PaginaAct || 1;
  this.NRegXPagina = this.NRegXPagina || 10;
  this.NTotalRegistros = this.NTotalRegistros;
  this.MaxPag = this.MaxPag || 1;

  this.RegInicio = this.RegInicio || 1;
  this.RegFin = this.RegFin || 1;

  this.CalculaRegistrosAMostrar = function() {

    if (this.NRegXPagina < 0) { this.NRegXPagina = 1 };
    this.MaxPag = Math.ceil(this.NTotalRegistros / this.NRegXPagina);
    if (this.MaxPag == 0) { this.MaxPag = 1 };
    if (this.PaginaAct == 0) { this.PaginaAct = 1 };
    if (this.PaginaAct > this.MaxPag) { this.PaginaAct = this.MaxPag };

    this.RegInicio = (this.PaginaAct - 1) * this.NRegXPagina;
    var RFin = this.PaginaAct * this.NRegXPagina;
    if (RFin > this.NTotalRegistros) { RFin = this.NTotalRegistros };
    this.RegFin = RFin;
    if (this.RegFin < 0) { this.RegFin = 0; }
    if (this.RegInicio < 0) { this.RegInicio = 0; }

  }
}

MAPA.Paginator =  function (o){
  var f = new function(){
    var OnSetText = o.OnSetText;
    var Locations = o.Locations       
    this.__Proc = function(sender){ 
      // Funcion generica de control para las pulsaciones en las cajas de texto
      var __KeyHandler = function(e) {
        var keyCode = (window.event) ? event.keyCode : e.keyCode;
        __Id= this.id;
        switch (keyCode) {
          case 38:
            sender._MoveNext();            
            setTimeout(function() { $(__Id).focus() }, 100)            
            break;
          case 40:
            sender._MovePrevious()
            setTimeout(function() { $(__Id).focus() }, 100)            
            break;
          case 13:
            sender._Move(this.value,this.id);                       
            MAPA.cancelEvent(e);
            return false;
        }
        return true;
      }
      // Funcion generica de control de la entrada del ratón
      var __EnterHandler = function() {
        if (this.className.contains('PagDes')) return;
        this.className = this.className.replace('over','').trim() + ' over';
      }
      // Funcion generica de control de la salid del ratón
      var __LeaveHandler = function() {this.className = this.className.replace('over','').trim()} 
            
      // notificar numero de registros
      var __DefaultText = function(){
        return String.format("Registros del {0} al {1}",sender.PageTableRender.RegInicio + 1 , sender.PageTableRender.RegFin, sender.PageTableRender.NTotalRegistros)
      }                        
      OnSetText({Range        :{Top     : sender.PageTableRender.RegInicio + 1 , 
                                Bottom  : sender.PageTableRender.RegFin}, 
                 Count        : sender.PageTableRender.NTotalRegistros,
                 Pages        : sender.PageTableRender.MaxPag,
                 CurrentPage  : sender.PageTableRender.PaginaAct,
                 DefaultText  : __DefaultText
               })
                 
      // Si no hay suficientes registros para que funcione el paginador limpiamos y salimos
      if (sender.PageTableRender.NTotalRegistros <= sender.PageTableRender.NRegXPagina){
        Locations.forEach(function(loc){ loc.innerHTML = '';});
        return;
      }                                        
                               
      // Crear tantos paginadores como Localizaciones tengamos
      var LocId = 55;
      var LastDiv;
      Locations.forEach(function(loc){
        loc.innerHTML = '';        
        loc.appendChild($.New('div', {onmouseover : __EnterHandler , onmouseout  :  __LeaveHandler, className:'Paginador PaginadorPrimero ' + ((sender.PageTableRender.PaginaAct==1) ? 'PagDes' : '' ), title : 'Ir a la primera página'  ,onclick: function(){sender._MoveFirst()}}))
        loc.appendChild($.New('div', {onmouseover : __EnterHandler , onmouseout  :  __LeaveHandler, className:'Paginador PaginadorAnterior ' + ((sender.PageTableRender.PaginaAct==1) ? 'PagDes' : '' ), title : 'Ir a la página anterior' ,onclick: function(){sender._MovePrevious()}}))
        loc.appendChild(
          $.New('div',{className :'PaginadorInput',
                       innerHTML : String.format('P&aacute;gina <input maxLength="{0}" id="txtIRPagina_{1}" size="2" type="text" value="{2}"/> de {3}',
                                                 sender.PageTableRender.MaxPag.toString().length,
                                                 sender.TableId + (++LocId),
                                                 sender.PageTableRender.PaginaAct,
                                                 sender.PageTableRender.MaxPag)}))                                                                                                    
        loc.appendChild($.New('div', {onmouseover : __EnterHandler , onmouseout  :  __LeaveHandler, className:'Paginador PaginadorSiguiente ' + ((sender.PageTableRender.PaginaAct==sender.PageTableRender.MaxPag) ? 'PagDes' : '' ), title : 'Ir a la página siguiente' ,onclick: function(){sender._MoveNext()}}))
        loc.appendChild($.New('div', {onmouseover : __EnterHandler , onmouseout  :  __LeaveHandler, className:'Paginador PaginadorUltimo ' + ((sender.PageTableRender.PaginaAct==sender.PageTableRender.MaxPag) ? 'PagDes' : '' )  , title : 'Ir a la última página' , onclick: function(){sender._MoveLast()}}))
        LastDiv = loc.lastChild;
        $(('txtIRPagina_' + sender.TableId) + LocId).onkeyup = __KeyHandler;        
      })     
      // si solo hay una caja de texto en el formulario
      // se produciría un post de la pagina. Así los evitamos                                         
      LastDiv.Add('input',{style : {display: 'none'}})                       
    }
  } 
  return f.__Proc;
}

MapaTableId = '5500';
$Table = function(e, options) {
  this.TableId = String.format('table-{0}', ++MapaTableId);
  this.DivElement = e;
  this.Header = [];
  this.GetValues = function() { return [] };
  this.TableCssClass = 'MTable';
  this.ParRowCssClass = 'MTable-Row-x';
  this.ImparRowCssClass = 'MTable-Row-x-impar';
  this.CheckImage = MAPA.DEFAULT_CHECK_IMG,
  this.UnCheckImage = MAPA.DEFAULT_UNCHECK_IMG,
  this.AlternateRow = true;
  this.TrackOn = false;

  this.HeaderRender = this.HeaderRender || this.DefaultHeaderRender;

  MAPA.apply(this, options);

  this.RowRender = this.RowRender || this.DefaultRowRender;
  this.ColRenders = this.ColRenders || [];
  this.OnRowClick = this.OnRowClick || function(e, index) { };
  this.OnRowRender = this.OnRowRender || function(e, index) { };

  this.TableSorter = this.TableSorter || undefined;
  this.PageTableRender = this.PageTableRender || undefined;

  if (this.ColRenders.length == 0) {
    for (x = 0; x < this.Header.length; x++) this.ColRenders[x] = $Table.DefaultColRender;
  };

  this.Sort = function(propName){ 
    this.DataSet = this.DataSet.OrderBy( function(e){ return e[propName]}); 
    return this;
  }

  this.RenderTable = function() {
    var t = [String.format(this.ts, this.TableCssClass || '')];
    if (this.HeaderRender) t.push(this.HeaderRender());

    var NRegIni = 0;
    var NRegFin = this.DataSet.length;
    if (this.PageTableRender) {
      this.PageTableRender.NTotalRegistros = this.DataSet.length;
      this.PageTableRender.CalculaRegistrosAMostrar();
      NRegIni = this.PageTableRender.RegInicio;
      NRegFin = this.PageTableRender.RegFin
    }

    for (x = NRegIni; x < NRegFin; x++) {
      t.push(this.RowRender(x));
      if (this.OnRowRender) this.OnRowRender(t, x);
    }
    t.push(this.te);

    this.DivElement.innerHTML = t.join('').replace('<table', String.format('<table id="{0}" ', this.TableId));
    this.DivElement.Table = this
    this.TBODY = this.DivElement.firstChild.getElementsByTagName('tbody')[0];
    this.TFOOT = this.DivElement.firstChild.getElementsByTagName('tfoot')[0];
    this.TABLE = this.DivElement.firstChild;
    MAPA.apply(this.DivElement.firstChild, this);

    if (this.TrackOn) this.SetTrackOn();
    // Asignamos el objeto del DataSet
    var D = this.DataSet;
    var THIS = this;
    var indice = -1 + NRegIni;
    MAPA.each(this.Rows(), function(e) {
      e.RowIndex = ++indice;
      e.RowData = D[e.RowIndex];
      e.firstChild.className = 'Check';
      if (THIS.StateControler) THIS.StateControler(e);
    }
    );

    if (this.TableSorter) { this.TableSorter.InitSortEngine(); }

    if (this.PageTableRender && this.PageTableRender.OnRenderCompleted) {
      this.PageTableRender.OnRenderCompleted(this);      
      return;
    }

    if (this.PageTableRender && this.DataSet.length > this.PageTableRender.NRegXPagina) {
      var THIS = this;
      this.TFOOT.appendChild(document.createElement("TR"));
      this.TFOOT.firstChild.appendChild(document.createElement("TD"));

      var MakeDiv = function(name) { var ndiv = document.createElement('div'); ndiv.className = name; return ndiv; };
      var cell = this.TFOOT.rows[0].cells[0];
      cell.colSpan = this.Header.length;

      cell.appendChild(MakeDiv("tfootContainer"));
      var DIV = cell.firstChild;
      DIV.appendChild(MakeDiv("Paginador PaginadorPrimero"))
      MAPA.AddEvent(DIV.lastChild, 'click', function() { THIS._MoveFirst() });
      DIV.appendChild(MakeDiv("Paginador PaginadorAnterior"))
      MAPA.AddEvent(DIV.lastChild, 'click', function() { THIS._MovePrevious() });

      DIV.appendChild(MakeDiv("PaginadorInput"))
      DIV.lastChild.innerHTML = String.format('P&aacute;gina <input maxLength="{0}" id="txtIRPagina_{1}" size="2" type="text" value="{2}"/> de {3}',
                                               THIS.PageTableRender.MaxPag.toString().length,
                                               THIS.TableId,
                                               THIS.PageTableRender.PaginaAct,
                                               THIS.PageTableRender.MaxPag);

      DIV.appendChild(MakeDiv("Paginador PaginadorSiguiente"))
      MAPA.AddEvent(DIV.lastChild, 'click', function() { THIS._MoveNext() });
      DIV.appendChild(MakeDiv("Paginador PaginadorUltimo"))
      MAPA.AddEvent(DIV.lastChild, 'click', function() { THIS._MoveLast() });

      DIV.appendChild(MakeDiv("PaginadorRegistro"));
      DIV.lastChild.innerHTML = String.format('Registros del {0} al {1} de {2}',
                                               THIS.PageTableRender.RegInicio + 1,
                                               THIS.PageTableRender.RegFin,
                                               THIS.PageTableRender.NTotalRegistros);
      // si solo hay una caja de texto en el formulario
      // se produciría un post de la pagina. Así los evitamos                                         
      DIV.lastChild.innerHTML += '<input type="text" style="display:none"/>';


      MAPA.AddEvent(document.getElementById('txtIRPagina_' + THIS.TableId), 'keyup', function(e) {
        var keyCode = (window.event) ? event.keyCode : e.keyCode;
        switch (keyCode) {
          case 38:
            THIS._MoveNext();
            setTimeout(function() { $('txtIRPagina_' + THIS.TableId).focus() }, 100)
            break;
          case 40:
            THIS._MovePrevious()
            setTimeout(function() { $('txtIRPagina_' + THIS.TableId).focus() }, 100)
            break;
          case 13:
            THIS._Move(document.getElementById('txtIRPagina_' + THIS.TableId).value);
            MAPA.cancelEvent(e);
            return false;
        }
        return true;
      });
    }
    return this;
  };
  this.SetTrackOff = function() {
    MAPA.each(this.Rows(),
      function(e) {
        MAPA.RemoveEvent(e, 'mouseover', e.OnMouseOver);
        MAPA.RemoveEvent(e, 'mouseout', e.OnMouseOut);
      }
    );
  };
  this.SetTrackOn = function() {
    MAPA.each(this.Rows(),
      function(e) {
        MAPA.AddEvent(e, 'mouseover', e.OnMouseOver = function() { $Table.prototype.On(e) });
        MAPA.AddEvent(e, 'mouseout', e.OnMouseOut = function() { $Table.prototype.Off(e) });
      }
    );
  };

}

$Table.prototype = {
  OnOver: true,
  OnOverColor: '#f0f0f0',
  ts: '<table class="{0}">',
  te: '<tfoot></tfoot></table>',
  rs: '<tr class="{0}" RowIndex={1} onclick="$Table.prototype.RaiseRowClick(this,this.RowIndex);">',
  re: '</tr>',
  cs: '<td>',
  ce: '</td>',
  DataSet: [],
  _MoveFirst: function() { this.PageTableRender.PaginaAct = 1; return this.RenderTable()},
  _MovePrevious: function() { --this.PageTableRender.PaginaAct; return this.RenderTable() },
  _MoveNext: function() { ++this.PageTableRender.PaginaAct; return this.RenderTable() },
  _MoveLast: function() { this.PageTableRender.PaginaAct = this.PageTableRender.MaxPag; return this.RenderTable() },
  _Move: function(pag,control) {
    this.PageTableRender.PaginaAct = MAPA.NaN(pag, this.PageTableRender.PaginaAct);
    this.RenderTable();
    var __Id = control ? control : 'txtIRPagina_' + this.TableId;
    setTimeout(function() { $(__Id).focus() }, 100)
  },
  DefaultColRender: function(text) { return [this.cs, text, this.ce].join(''); },
  DefaultRowRender: function(index) {
    var css = this.AlternateRow && (index % 2) ? this.ParRowCssClass : this.ImparRowCssClass;
    var buff = [String.format(this.rs, css, index)];
    var values = this.GetValues(this.DataSet[index]);
    for (i = 0; i < this.Header.length; ++i)
      if (this.ColRenders[i]) {
      buff.push(this.ColRenders[i](values[i]));
    }
    else {
      buff.push(this.DefaultColRender(values[i]));
    }
    buff.push(this.re);
    return buff.join('');
  },
  DefaultHeaderRender: function() {
    var buff = ['<thead><tr>'];
    if(this.PreHeader) buff.push(this.PreHeader());
    buff.push('<tr>');
    for (x = 0; x < this.Header.length; x++) {
      buff.push(['<th><span>', this.Header[x], '</span></th>'].join(''))
    }
    buff.push('</tr></thead>');
    return buff.join('');
  },
  RaiseRowClick: function(e, index) {
    var TB = e.parentNode  //TableBody
    var T = TB.parentNode; //Table;
    T.OnRowClick(e, index);
  },
  _ReClassRows: function() {
    var el = this.TBODY.firstChild
    if (!el) return
    var i = 0;
    do {
      el.className = (i % 2) ? this.ParRowCssClass : this.ImparRowCssClass;
      el = el.nextSibling;
      ++i;
    }
    while (el);
  },
  On: function(sender) {
    var TB = sender.parentNode  //TableBody
    var T = TB.parentNode;      //Table;

    if (!T.OnOver) return
    sender.OldValue = sender.style.backgroundColor;
    sender.style.backgroundColor = T.OnOverColor;
  },
  Off: function(sender) {
    var TB = sender.parentNode  //TableBody
    var T = TB.parentNode;      //Table;        
    if (!T.OnOver) return
    sender.style.backgroundColor = sender.OldValue;
  },
  RemoveRow: function(item) {
    //var T = this.TBODY.parentNode;  // Table;	     
    this.TBODY.removeChild(item);
    if (this.AlternateRow) this._ReClassRows();
  },
  SelectRow: function(item) {
    item.IsSelected = item.IsSelected || false;
    var im = String.format("url('{0}')", (item.IsSelected) ? this.UnCheckImage : this.CheckImage);
    item.firstChild.style.backgroundImage = im;
    item.IsSelected = !item.IsSelected;
  },
  Rows: function() {
    return (this.TBODY || {getElementsByTagName : function(){return undefined}}).getElementsByTagName('tr') || [];
  },
  SelectedRows: function() {
    var ii = [];
    MAPA.each(this.Rows(), function(e) { if (e.IsSelected || false) ii.add(e) });
    return ii;
  },
  SelectedIndices: function() {
    var ii = [];
    var x = -1;
    MAPA.each(this.Rows(), function(e) { ++x; if (e.IsSelected || false) ii.add(x) });
    return ii;
  },
  GetItemAt: function(index) {
    var f = this.TBODY.firstChild
    var i = 0;
    do {
      if (index == i) return f
      f = f.nextSibling;
      ++i;
    }
    while (f);
    return undefined;
  }
};


MAPA.DataSorter = function(options) {
  MAPA.apply(this, options);
  this.Sorters = this.Sorters || [];
  this.Table = this.Table;
  this.ElementLastSorted = this.ElementLastSorted || undefined;

  this.InitSortEngine = function() {
    var THIS = this;
    this.Sorters.forEach(function(s, indice) {
      var celda = THIS.Table.TABLE.getElementsByTagName('th')[s.colIndex];
      celda.firstChild.className = 'sortX';
      MAPA.AddEvent(celda.firstChild, 'click', s.DoSort);
      celda.insertBefore(s.Element, celda.firstChild);
    });
  }
};

MAPA.DataSorter.prototype.add = function(ColSorter) { this.Sorters.add(ColSorter); };

MAPA.ColSorter = function(options) {
  MAPA.apply(this, options);

  this.direction = this.direction || 'NONE';
  this.sortFn = this.sortFn || this.defaultSortFn;
  this.colIndex = this.colIndex || 0;
  this.colName = this.colName || '';
  this.Tabla = this.Tabla;
  this.OrderImageNone = this.OrderImageNone || 'url(../img/arrow-none3.gif)';
  this.OrderImageUp = this.OrderImageUp || 'url(../img/arrow-up3.gif)';
  this.OrderImageDown = this.OrderImageDown || 'url(../img/arrow-down3.gif)';
  this.DoSort = InitSort;

  this.Element = document.createElement('span');
  this.Element.ColSorter = this;
  this.Element.className = 'ColSorter';
  
  this.Element.title = 'Sin Orden';
  if (this.direction == 'ASC') {
    this.Element.className = 'ColSorterUp';
    this.Element.title = 'Orden Ascendente';
  }
  if (this.direction == 'DES') {
    this.Element.className = 'ColSorterDown';
    this.Element.title = 'Orden Descendente';
  }
  
  this.SetCurrent = function(value){  
    me.direction = value;    
    InitSort(true);
  }

  MAPA.AddEvent(this.Element, 'click', InitSort);

  var me = this;
  function InitSort() {
    var __Last = me.Tabla.TableSorter.ElementLastSorted;
    if (__Last) {
      __Last.className = 'ColSorter';
      __Last.title = 'Sin Orden';
      if (__Last != me.Element) me.direction = 'NONE';
    };

    if (me.direction == 'ASC' || me.direction == 'NONE') {
      me.direction = 'DES';
      me.Element.className = 'ColSorterUp';
      me.Element.title = 'Orden Ascendente';
    }
    else {
      me.direction = 'ASC';
      me.Element.className = 'ColSorterDown';
      me.Element.title = 'Orden Descendente';
    }
    me.Tabla.TableSorter.ElementLastSorted = me.Element;
    me.sortFn(me);
    me.Tabla.RenderTable();
  }
  return this;
}

MAPA.ColSorter.prototype.CusttomSortFn = function() {
  var d = this.direction == 'DES' ? 1 : -1;
  var indice = this.colName;
  var __fn = this.comparer;
  this.Tabla.DataSet.sort(function(a, b) {
    var aI = indice ? __fn(a[indice]) : __fn(a) ;
    var bI = indice ? __fn(b[indice]) : __fn(b) ;
    return (aI == bI ? 0 : (aI < bI) ? -1 : 1) * d;
  })
}

MAPA.ColSorter.prototype.defaultSortFn = function() {
  var d = this.direction == 'DES' ? 1 : -1;
  var indice = this.colName;
  this.Tabla.DataSet.sort(function(a, b) {
    var aI = ('' + a[indice]).toLocaleLowerCase();
    var bI = ('' + b[indice]).toLocaleLowerCase();
    return (aI == bI ? 0 : (aI < bI) ? -1 : 1) * d;
  })
}
MAPA.ColSorter.prototype.defaultIntSortFn = function() {
  var d = this.direction == 'DES' ? 1 : -1;
  var indice = this.colName;
  this.Tabla.DataSet.sort(function(a, b) {
    var aI = parseInt(a[indice]);
    var bI = parseInt(b[indice]);
    return (aI == bI ? 0 : (aI < bI) ? -1 : 1) * d;
  })
}
MAPA.ColSorter.prototype.defaultDateTimeSortFn = function() {
  var d = this.direction == 'DES' ? 1 : -1;
  var indice = this.colName;
  this.Tabla.DataSet.sort(function(a, b) {
    var A = a[indice].split(' ')[0].split('/');
    var aI = new Date(A[2], --A[1], A[0]).valueOf();
    var B = b[indice].split(' ')[0].split('/');
    var bI = new Date(B[2], --B[1], B[0]).valueOf();
    var __time = function(){
      var t1 = a[indice].split(' ')[1] || '';
      var t2 = b[indice].split(' ')[1] || '';
      if(t1 == t2) return 0;
      var __v1 = t1.split(':');
      var __v2 = t2.split(':');
      t1= (__v1[0] * 3600) + (__v1[1] * 60) + ~~__v1[2];
      t2= (__v2[0] * 3600) + (__v2[1] * 60) + ~~__v2[2];
      return (t1 == t2 ? 0 : (t1 < t2) ? -1 : 1) 
    }
    return (aI == bI ? __time() 
                     : (aI < bI) ? -1 : 1) * d;
  })
}


$Cookie = {};
MAPA.apply($Cookie, {
  path: "/",
  expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 7)),
  domain: null,
  secure: false,
  readCookies: function() {
    var cookies = {};
    var c = document.cookie + ";";
    var re = /\s?(.*?)=(.*?);/g;
    var matches;
    while ((matches = re.exec(c)) != null) {
      var name = matches[1];
      var value = matches[2];
      if (name && name.substring(0, 5) == "MARM-") {
        cookies[name.substr(5)] = this.decodeValue(value);
      }
    }
    return cookies;
  },
  setCookie: function(name, value, days) {
    document.cookie = "MARM-" + name + "=" + this.encodeValue(value) +

    ((days) ? "; expires=" + new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * days)).toGMTString()
            : (this.expires == null) ? "" : ("; expires=" + this.expires.toGMTString())) +

    ((this.path == null) ? "" : ("; path=" + this.path)) +
    ((this.domain == null) ? "" : ("; domain=" + this.domain)) +
    ((this.secure == true) ? "; secure" : "");
  },
  clearCookie: function(name) {
    document.cookie = "MARM-" + name + "=null; expires=Thu, 01-Jan-70 00:00:01 GMT" +
           ((this.path == null) ? "" : ("; path=" + this.path)) +
           ((this.domain == null) ? "" : ("; domain=" + this.domain)) +
           ((this.secure == true) ? "; secure" : "");
  },
  encodeValue: function(v) {
    var enc;
    if (typeof v == "number") {
      enc = "n:" + v;
    } else if (typeof v == "boolean") {
      enc = "b:" + (v ? "1" : "0");
    } else if (v instanceof Date) {
      enc = "d:" + v.toGMTString();
    } else if (v instanceof Array) {
      var flat = "";
      for (var i = 0, len = v.length; i < len; i++) {
        flat += this.encodeValue(v[i]);
        if (i != len - 1) flat += "^";
      }
      enc = "a:" + flat;
    } else if (typeof v == "object") {
      var flat = "";
      for (var key in v) {
        if (typeof v[key] != "function") {
          flat += key + "=" + this.encodeValue(v[key]) + "^";
        }
      }
      enc = "o:" + flat.substring(0, flat.length - 1);
    } else {
      enc = "s:" + v;
    }
    return escape(enc);
  },
  decodeValue: function(cookie) {
    var re = /^(a|n|d|b|s|o)\:(.*)$/;
    var matches = re.exec(unescape(cookie));
    if (!matches || !matches[1]) return;
    var type = matches[1];
    var v = matches[2];
    switch (type) {
      case "n":
        return parseFloat(v);
      case "d":
        return new Date(Date.parse(v));
      case "b":
        return (v == "1");
      case "a":
        var all = [];
        var values = v.split("^");
        for (var i = 0, len = values.length; i < len; i++) {
          all.push(this.decodeValue(values[i]));
        }
        return all;
      case "o":
        var all = {};
        var values = v.split("^");
        for (var i = 0, len = values.length; i < len; i++) {
          var kv = values[i].split("=");
          all[kv[0]] = this.decodeValue(kv[1]);
        }
        return all;
      default:
        return v;
    }
  }
});


MAPA.Dictionary = function() { this.hash = {}; };
MAPA.applyIf(MAPA.Dictionary.prototype, {
  hasKey: function(key) { return this.hash[key] != undefined },
  keys: function() {
    var asKeys = [];
    for (var sKey in this.hash) asKeys.push(sKey);
    return asKeys;
  },
  item: function(key) {
    if (!this.hasKey(key)) throw Exception("Key doesn't exist");
    return this.hash[key];
  },
  add: function(key, value) { this.hash[key] = value; },
  remove: function(key) {
    if (!this.hasKey(key)) throw Exception("Key doesn't exist");
    var oOld = this.item(key);
    delete this.hash[key];
    return oOld;
  },
  count: function() { return this.keys().length },
  clear: function() { this.hash = {}; }
});


MAPA.InfoBox = function(mensaje, imagen, data) {
  var me = this;
  this.Data = data;
  this.Element = document.createElement('div');
  this.Element.InfoBox = this;
  this.Element.title = mensaje;
  this.Element.className = 'InfoBox';
  if(imagen.beginsWith('-')){
    this.Element.className += ' ' + imagen.split('-')[1];
  }else{
    this.Element.style.backgroundImage = String.format('url({0})', imagen);
  }
  
  MAPA.AddEvent(this.Element, 'click', removeMe)
  function removeMe() {
    me.Element.parentNode.removeChild(me.Element);
    if (me.Data.InfoBox) delete me.Data.InfoBox;
  }
  return this;
}

MAPA.ToolBar = function(e) {
  this.Element = e;
  this.buttons = new MAPA.Dictionary();
  var me = this;
  MAPA.each(this.Element.childNodes, function(e) {
    var b = new MAPA.ToolBarButton({ Element: e })
    me.buttons.add(b.Id, b);
  }
	);
}

MAPA.applyIf(MAPA.ToolBar.prototype, {
  Buttons: function(index) {
    var id = index;
    if (MAPA.isNumber(index)) {
      id = String.leftPad(index, 3, '0');
      id = String.format('{0}-{1}', this.Element.id, id);
    };
    return this.buttons.item(id);
  },
  RemoveButton: function(button) {
    if (this.buttons.remove(button.Id)) this.Element.removeChild(button.Element);
  },
  AddButton: function(button, pos) {
    this.Element.appendChild(button.Element)
    this.buttons.add(button.Id, button)
  },
  Show: function() { this.Element.style.display = 'block' },
  Hide: function() { this.Element.style.display = 'none' }
});

MAPA.ToolBarButton = function(o) {
  options = { Id: '', Texto: '', Url: '', ImageUrl: '' };
  if (o) MAPA.apply(options, o);
  MAPA.apply(this, options);
  if (this.Element) {
    this.Id = this.Element.id;
    return this;
  }
  this.Render()
}

MAPA.applyIf(MAPA.ToolBarButton.prototype, {
  Render: function() {
    var url = this.Url || '';
    var imageUrl = this.ImageUrl || '';
    var texto = this.Texto || '.';
    var align = this.Align || 'left';

    if (url == '') this.Element = document.createElement('div');
    if (url != '') {
      this.Element = document.createElement('a');
      this.Element.setAttribute('href', url);
      this.OldUrl = url;
    }
    if (this.Titulo) this.Element.title = this.Titulo;
    if (imageUrl != '') {
      this.Element.className = 'icon';
      if(imageUrl != '-') this.Element.style.backgroundImage = String.format('url({0})', imageUrl);
    }
    this.Element.id = this.Id;
    this.Element.style.cssFloat = align + ' !important';

    if (texto != '.') {
      this.Element.appendChild(document.createTextNode(texto));
      return;
    }
    if (MAPA.isIE) {
      this.Element.appendChild(document.createTextNode(''));
      return;
    }
    this.Element.appendChild(document.createElement('h1'));

  },
  Enable: function() {
    if (this.Element.style.opacity == '1') return;
    this.Element.style.opacity = '1';
    this.Element.style.filter = 'alpha(opacity=100)';
    this.Element.setAttribute('href', this.OldUrl || this.Element.getAttribute('href'));
    this.Element.style.cursor = this.OldCursor || 'pointer';
  },
  Disable: function() {
    if (this.Element.style.opacity == '0.2') return;
    this.Element.style.opacity = '0.2';
    this.Element.style.filter = 'alpha(opacity=20)';
    this.OldUrl = this.Element.getAttribute('href');
    this.OldCursor = this.Element.cursor;
    this.Element.style.cursor = 'default';
    this.Element.removeAttribute('href');
  },
  Show: function() { this.Element.style.display = 'block' },
  Hide: function() { this.Element.style.display = 'none' }
});

MAPA.ContextMenu = function(o) {
  var THIS = this;
  if (o) MAPA.apply(this, o);

  this.StartElement = this.StartElement || undefined;
  this.Width = this.Width || '150px';
  this.Position = this.Position || { X: 20, Y: 30 }
  this.MenuItems = this.MenuItems || [];

  if (!this.Element) {
    this.Element = document.createElement('div');
    this.Element.className = 'ContextMenu';
    this.Element.style.filter = 'progid:DXImageTransform.Microsoft.shadow(direction=135,color=#c0c0c0,strength=5)'
    this.Element.style.filterShadow = true
    this.Element.id = this.Id || String.format('MapaContextMenu{0}', ++this.__Counter);
    document.body.insertBefore(this.Element, document.body.firstChild);
  }

  this.MenuItems.forEach(function(item) {
    THIS.Element.appendChild(item.Element);
    THIS.SetItemWidth(item);
  });

  this.Move(this.Position)

  return this;
}

MAPA.ContextMenu.__Last = undefined;
MAPA.applyIf(MAPA.ContextMenu.prototype, {
  __Counter: 0,
  Show: function() {
    var THIS = this;                           
    this.__e = function() { THIS.__src = document; THIS.Hide(); }
    if (this.StartElement) this.Move(this.GetMenuShowPosition(this.StartElement));
    this.Element.style.display = 'block';
    if (MAPA.ContextMenu.__Last) MAPA.ContextMenu.__Last.Hide();
    MAPA.ContextMenu.__Last = THIS;
    MAPA.AddEvent(document, 'click', this.__e);
  },
  Hide: function() {                                               
    MAPA.Animation.Fade({ OnTerminate : function(){ this.Element.style.display = 'none' }, Element: this.Element }).Run()     
    MAPA.RemoveEvent(document, 'click', this.__e);
    var THIS = this;
    setTimeout(function() { THIS.__src = null }, 100)
    MAPA.ContextMenu.__Last = undefined;
  },
  Toggle: function() {  
    
    if (this.__src == document) {
      this.__DocumentClick = null;
      this.Element.style.display = 'none';
      MAPA.RemoveEvent(document, 'click', this.__e);
      if (MAPA.ContextMenu.__Last) MAPA.ContextMenu.__Last.Hide(); 
      return
    }
    if (this.StartElement) this.Move(this.GetMenuShowPosition(this.StartElement));
    if (this.Element.style.display == 'none') { 
      if (MAPA.ContextMenu.__Last) MAPA.ContextMenu.__Last.Hide();     
      this.Element.style.display = 'block';
      MAPA.ContextMenu.__Last = this;
      MAPA.AddEvent(document, 'click', this.__e);
    }
    else {
      MAPA.RemoveEvent(document, 'click', this.__e);
      this.Element.style.display = 'none';
      if (MAPA.ContextMenu.__Last) MAPA.ContextMenu.__Last = undefined;
    }
  },
  Move: function(o) {
    this.Element.style.top = String.format('{0}px', o.Y);
    this.Element.style.left = String.format('{0}px', o.X);
  },
  SetItemWidth: function(i) {
    var margin = i.IsSeparador ? 14 : 10;
    i.Element.style.width = String.format('{0}px', parseInt(this.Width) - margin);
  },
  AddMenuItem: function(i) {
    this.MenuItems.add(i);
    this.Element.appendChild(i.Element);
    this.SetItemWidth(i);
    return i;
  },
  RemoveMenuItem: function(i) {
    this.MenuItems.remove(i);
    this.Element.removeChild(i.Element);
  },
  GetMenuShowPosition: function(element) {
    var pos = this.GetElementPosition(this.StartElement)
    return { X: pos.X, Y: pos.Y + parseInt(this.StartElement.offsetHeight) };
  },
  GetElementPosition: function(e,r) {
    if (!e.currentStyle && window.getComputedStyle) e.currentStyle = document.defaultView.getComputedStyle(e, null);
    var NaN0 = function(value) { return isNaN(value) ? 0 : value; }
    var top = e.currentStyle ? -NaN0(parseInt(e.currentStyle.marginTop)) : 0;
    var left = e.currentStyle ? -NaN0(parseInt(e.currentStyle.marginLeft)) : 0;
    while (e.offsetParent) {
      left += e.offsetLeft + (e.currentStyle ? (NaN0(parseInt(e.currentStyle.borderLeftWidth))) : 0);
      if(!r){
        left -= e.scrollLeft;
      }
      top += e.offsetTop + (e.currentStyle ? (NaN0(parseInt(e.currentStyle.borderTopWidth))) : 0);
      if(!r){
        top -= e.scrollTop;      
      }
      e = e.offsetParent;
    }
    top += (e.currentStyle ? (NaN0(parseInt(e.currentStyle.marginTop))) : 0);
    top += e.offsetTop + (e.currentStyle ? (NaN0(parseInt(e.currentStyle.borderTopWidth))) : 0);
    left += e.offsetLeft + (e.currentStyle ? (NaN0(parseInt(e.currentStyle.borderLeftWidth))) : 0);
    left += (e.currentStyle ? (NaN0(parseInt(e.currentStyle.marginLeft))) : 0);
    return { X: left, Y: top };
  }
})

MAPA.ContextMenuItem = function(o) {
  if (o) MAPA.apply(this, o);

  this.Text = this.Text || 'nombre';
  this.Id = this.Id || String.format('MapaContextMenuItem{0}', ++this.__Counter)
  this.IsSeparador = this.Text == '-';
  this.OnClick = this.OnClick || function() { };
  this.Element = document.createElement('div');
  this.Element.id = this.Id
  if (o.Image) this.Element.style.backgroundImage = String.format('url({0})', o.Image);
  if (o.className) this.Element.className = o.className;
  
  if (this.IsSeparador) { this.Element.className = 'separador'; return this; }

  var __t = document.createTextNode(this.Text);
  if (this.Actual) this.Element.style.fontWeight = 'bold';
  this.Element.appendChild(__t);
  var THIS = this;
  var __enter = function() { THIS.Element.className = (o.className || '') + ' over'; }
  var __out   = function() { THIS.Element.className = o.className || ''; }
  var __click = function() { THIS.OnClick(THIS) }
  MAPA.AddEvent(this.Element, 'mouseover', __enter);
  MAPA.AddEvent(this.Element, 'mouseout', __out);
  if(o._onclick){
    this.Element._onclick = o._onclick;  
  }else{
    MAPA.AddEvent(this.Element, 'click', __click);
  }

  return this
}
MAPA.applyIf(MAPA.ContextMenuItem.prototype, {
  __Counter: 0,
  SetActual: function() {
    var __valor = true
    if (arguments.length == 1) __valor = arguments[0];
    this.Element.style.fontWeight = __valor ? 'bold' : 'normal';
  }
});

MAPA.applyIf(Date.prototype, {
  Format: function() {
    return String.format('{0}/{1}/{2}',
                              String.leftPad(this.getDate(), 2, '0'),
                              String.leftPad(this.getMonth() + 1, 2, '0'), this.getFullYear())
  }
})

Date.ParseTextBox = function(control, msg) {
  if (control.value) {
    var Res = Date.IsDate(control.value)
    if (Res.IsDate == false) throw new Error(msg);
    control.value = Res.DateString;
  }
}
Date.IsDate = function(s, r) {
  var formato = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{2,4}$/
  s = s.replaceAll('-', '/')
  if (formato.test(s) == true) {
    var values = s.split('/');
    var dia = MAPA.NaN(values[0] * 1, 0);
    var mes = MAPA.NaN(values[1] * 1, 0) - 1;
    var year = MAPA.NaN(values[2] * 1, 0);


    if (year == 0) return { IsDate: false, DateString: '' };
    if (year < 50) year += 2000;
    if (year < 100) year += 1900;

    if (dia < 1 || dia > 31) return { IsDate: false, DateString: '' };
    if (mes < 0 || mes > 11) return { IsDate: false, DateString: '' };

    var fecha = new Date(year, mes, dia);
    if (fecha.getFullYear() != year ||
        fecha.getMonth() != mes ||
        fecha.getDate() != dia ||
        fecha.getFullYear() <= 1900 ||
        fecha.getFullYear() >= 2100) return { IsDate: false, DateString: '' };
    return { IsDate: true,
      DateString: String.format('{0}/{1}/{2}',
                                         String.leftPad(dia, 2, '0'),
                                         String.leftPad(mes + 1, 2, '0'), year),
      Date: fecha
    }
  }
  return { IsDate: false, DateString: '', Date: fecha };
}

Date.UTCext = function(fecha) { return Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()); }

Date.Assert = function(value) {
  var that = {
    target: value,
    Text: (value.tagName ? value.value : (value || '')).trim().split(' ')[0],
    Date: Date.IsDate((value.tagName ? value.value : (value || '')).trim().split(' ')[0]),
    HasValue: function(msg)
    {
      if (!this.Date.IsDate) { throw new Error(msg) }
      return this;
    },
    IsValid: function(msg)
    {
      if (!this.Date.IsDate) { throw new Error(msg) }
      return this;
    },
    IsValidOrEmpty: function(msg)
    {
      if (this.Text && !this.Date.IsDate) { throw new Error(msg) }
      return this;
    },
    IsRequiredIf: function(ref, msg)
    {
      if ((ref.value != '') && !this.Date.IsDate) { throw new Error(msg) }
      return this;
    },
    IsAfter: function(value, msg)
    {
      if(!this.Date.IsDate) return this;
      if (value.IsBefore)
      {
        if (Date.UTCext(this.Date.Date) < Date.UTCext(value.Date.Date)) throw new Error(msg);
        return this;
      }
      var __Text = (value.tagName ? value.value : (value || '')).trim().split(' ')[0];
      if (!__Text) return this;
      if (Date.UTCext(this.Date.Date) < Date.UTCext(Date.IsDate(__Text).Date)) throw new Error(msg);
      return that;
    },
    IsBefore: function(value, msg)
    {
      if(!this.Date.IsDate) return this;
      if (value.IsBefore)
      {
        if (Date.UTCext(this.Date.Date) > Date.UTCext(value.Date.Date)) throw new Error(msg);
        return this;
      }
      var __Text = (value.tagName ? value.value : (value || '')).trim().split(' ')[0];
      if (!__Text) return this;
      if (Date.UTCext(this.Date.Date) > Date.UTCext(Date.IsDate(__Text).Date)) throw new Error(msg);
      return this;
    }
  }
  return that;
}

MAPA.DragHelper = function() {
  var THIS = this;
  this.mouseOffset = null;
  this.dragObject = null;
  this._Id = String.format('DragHelper{0}', ++this.C);

  var _mouseUp = function(ev) {
    if (!THIS.dragObject) return
    THIS.dragObject.className = THIS.dragObject.className.replaceAll('XdragX', ' ').trim();
    THIS.dragObject = null;
    THIS.mouseOffset = null;
    THIS.iMouseDown = false;
  }
  var _mouseMove = function(ev) {
    ev = ev || window.event;
    var target = ev.target || ev.srcElement;
    var mousePos = MAPA.DragHelper.prototype.mouseCoords(ev);
    if (!THIS.dragObject) return true;
    THIS.dragObject.style.position = 'absolute';
    THIS.dragObject.style.top = String.format('{0}px', mousePos.y - THIS.mouseOffset.y);
    THIS.dragObject.style.left = String.format('{0}px', mousePos.x - THIS.mouseOffset.x);
    return false
  }

  MAPA.AddEvent(document, 'mousemove', _mouseMove);
  MAPA.AddEvent(document, 'mouseup', _mouseUp);
  return this;
}


MAPA.applyIf(MAPA.DragHelper.prototype, {
  __ControlCounter: 0,
  mouseCoords: function(ev) {
    if (ev.pageX || ev.pageY)
      return { x: ev.pageX, y: ev.pageY };
    else
      return { x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y: ev.clientY + document.body.scrollTop - document.body.clientTop
      };
  },
  getMouseOffset: function(target, ev) {
    ev = ev || window.event;
    var docPos = MAPA.ContextMenu.prototype.GetElementPosition(target);
    var mousePos = this.mouseCoords(ev);
    return { x: mousePos.x - docPos.X, y: mousePos.y - docPos.Y };
  },
  MakeDragable: function(e, o) {
    var THIS = this;
    e = e.Element || e;
    o = o || new MAPA.RECT({ left: 0, right: 0, top: 0, bottom: 20 })
    e.onmousedown = function(ev) {
      THIS.mouseOffset = THIS.getMouseOffset(e, ev);
      var __bottom = MAPA.isIE ? o.bottom : o.bottom + MAPA.GetScrollY();
      if (THIS.mouseOffset.y + MAPA.GetScrollY() > o.top && THIS.mouseOffset.y + MAPA.GetScrollY() < __bottom) {
        e.className += ' XdragX';
        if (e.IsOpaque) {
          e.style.opacity = '1';
          e.style.filter = 'alpha(opacity=100)';
        }
        THIS.dragObject = e;
        return false;
      }
    }
  }
});


MAPA.Animation = {}
MAPA.Animation.Fade = function(o){
  var that = {}
  var __serie = o.Serie || MAPA.Serie([1, 1, 0.91, 0.81, 0]);
  var __Last = function(){ if(o.OnTerminate) o.OnTerminate() }                          
  var __Step = function(){
    var current = __serie.Next();
    if(current){                                                            
      MAPA.SetOpacity(o.Element, current)               
      setTimeout(__Step, 15);                    
    }
    else
    {                
      MAPA.SetOpacity(o.Element, 1)
      __Last()  
    }              
  }            
  that.Run = function(){ __Step();}              
  return that
}

MAPA.LocatorControl = function(options) {
  var THIS = this;
  MAPA.apply(this, options);
  this.Id = this.Id || String.format('LocatorControl-{0}', MAPA.LocatorControl.__ControlCounter++);
  this.TargetControl = this.TargetControl || null;
  this.RefControl = this.RefControl || null;
  this.__OnDocumentClick = function(ev) {
    var e = MAPA.MapaEvent(ev);
    var offset = MAPA.DragHelper.prototype.getMouseOffset(document.body, ev);
    var pos = MAPA.ContextMenu.prototype.GetElementPosition(THIS.TargetControl);
    var r = {
      top: pos.Y,
      left: pos.X,
      // bottom: parseInt(THIS.TargetControl.style.height || THIS.TargetControl.clientHeight) + parseInt(pos.Y),
      // right: parseInt(THIS.TargetControl.style.width   || THIS.TargetControl.clientWidth) + parseInt(pos.X)
      bottom: parseInt(THIS.TargetControl.offsetHeight || THIS.TargetControl.clientHeight) + parseInt(pos.Y),
      right: parseInt(THIS.TargetControl.offsetWidth || THIS.TargetControl.clientWidth) + parseInt(pos.X)
    };
    offset.y = offset.y + MAPA.GetScrollY();
    offset.x = offset.x + MAPA.GetScrollX();

    var __bottom = MAPA.isIE ? r.bottom : r.bottom + MAPA.GetScrollY();
    var __right = MAPA.isIE ? r.right : r.right + MAPA.GetScrollX();
    var __top = MAPA.isIE ? r.top : r.top + MAPA.GetScrollY();

    // Cerrar el elemento si se pulsa en algun lugar fuera de el.
    if ((offset.x < r.left) || (offset.x > __right) ||
        (offset.y < __top) || (offset.y > __bottom)) {
      THIS.Hide();
      return MAPA.cancelEvent(ev);
    }

    if (options && options.SizeTargetControl) {
      THIS.Resize = function() {
        if (THIS.TargetControl.style.pixelWidth) {
          var value = THIS.SizeValue || 0;
          THIS.TargetControl.style.pixelWidth = THIS.RefControl.style.pixelWidth + (THIS.SizeValue || -2);
          return;
        }
        if (THIS.RefControl.style.width.endsWith('%')) {
          THIS.TargetControl.style.width = THIS.RefControl.style.width;
          return;
        }
        THIS.TargetControl.style.width = (parseInt(THIS.RefControl.style.width.replace('px', '')) + (THIS.SizeValue || -2)) + 'px'
      }
      MAPA.AddEvent(window, 'resize', THIS.Resize);
    }
  }
}

MAPA.LocatorControl.__ControlCounter = 0;
MAPA.applyIf(MAPA.LocatorControl.prototype, {
  Show: function() {
    this.TargetControl.Show ? this.TargetControl.Show()
                            : this.TargetControl.style.display = 'block';

    var pos = MAPA.ContextMenu.prototype.GetElementPosition(this.RefControl);
    var target = this.TargetControl.Element || this.TargetControl
    pos.X -= parseInt(document.body.offsetLeft);
    target.style.left = pos.X + 'px';
    pos.Y -= parseInt(document.body.offsetTop);
    target.style.top = pos.Y + parseInt(this.RefControl.offsetHeight) + 'px';

    if (this.Resize) this.Resize();
    MAPA.AddEvent(document, 'mousedown', this.__OnDocumentClick);
  },
  Hide: function() {
    this.TargetControl.Hide ? this.TargetControl.Hide()
                            : this.TargetControl.style.display = 'none';
    MAPA.RemoveEvent(document, 'mousedown', this.__OnDocumentClick);
    if (this.HideInternal) this.HideInternal();
  },
  IsVisible: function() { return (this.TargetControl.style.display != 'none'); }
});


MAPA.Layer = function() {

  var that = {};
  
  var _layer;
  var _initLayer = function() {
    if (!_layer) {  _layer = $.$('div', { className: 'W1-Layer' }); document.body.insertBefore(_layer, document.body.firstChild); }    
  };

  that.Show = function() {
    _initLayer();
    _layer.style.display = 'block';
    _layer.style.height = (((document.body.getAttribute('scroll') || document.body.scroll) + '').toLowerCase() == 'no') ? '' : window.getComputedStyle ? window.getComputedStyle(document.body).height : window.document.body.clientHeight;    
    var __form = document.getElementsByTagName('form')[0];
    if (__form && !that.NoDisable) __form.disabled = true;
    MAPA.DialogHelper.HideAll();
  };

  var _Dlg;
  that.ShowInfo = function(o) {
    that.NoDisable = o.NoDisable || false;    
    that.Show();
    if(_Dlg) _Dlg.Close();
    _Dlg = MAPA.Dialog({ CanMove: true , RemoveOnClose: true});
    var __sp = MAPA.GetScrollPositions();
    if (__sp.y>0){
      var __E = _Dlg.Element.style;
      __E.width = String.format('{0}px', o.Width || 200);
      __E.height = String.format('{0}px', o.Height || 45);
      __E.left = String.format('{0}px', (document.documentElement.clientWidth  /2) - ((o.Width || 200) / 2));  
      __E.top = String.format('{0}px', (document.documentElement.clientHeight  /2) - ((o.Height || 45) / 2) + __sp.y );      
    }else{
      _Dlg.Center2(o.Width || 200, o.Height || 45);
    }
    
    _Dlg.Caption.style.display = _Dlg.Footer.style.display = 'none';
    _Dlg.Body.style.top = _Dlg.Body.style.bottom = '0.4em';
    _Dlg.Body.className += ' info_image';
    if (o && MAPA.isString(o)){
     _Dlg.Body.innerHTML = '<div class="img">' + o + '</div>';
    } else if (o.Message) {
     _Dlg.Body.innerHTML = '<div class="img">' + o.Message + '</div>';
    }
    var __bak = _Dlg.Close;
    _Dlg.Close = function() {
      _Dlg.RemoveOnclose = true;  __bak(); if(o.Dialog) o.Dialog.UnShadow(); if(o.OnClose) o.OnClose();
    }
    if (__sp.y>0){
       return _Dlg.Show();
    }else{
      return _Dlg.Show().Center();
    }    
  };

  that.ShowError = function(o,onclose) {
    if(o.Dialog) o.Dialog.Element.style.zIndex = '9000';
    //if(_Dlg) _Dlg.Close();
    that.Show();     
    var _Dlg = MAPA.Dialog({ Title: o.Title || 'Error', CanMove: true, RemoveOnClose: true });
    var __sp = MAPA.GetScrollPositions();
    if (__sp.y>0){
      var __E = _Dlg.Element.style;
      __E.width = String.format('{0}px', o.Width || 400);
      __E.height = String.format('{0}px', o.Height || 130);
      __E.left = String.format('{0}px', (document.documentElement.clientWidth  /2) - ((o.Width || 400) / 2));  
      __E.top = String.format('{0}px', (document.documentElement.clientHeight  /2) - ((o.Height || 130) / 2) + __sp.y );      
    }else{
      _Dlg.Center2(o.Width || 400, o.Height || 130);
    }
    
    if($('mobileMenuHandler') && $('mobileMenuHandler').offsetHeight>0 && document.documentElement.clientWidth<321){              
      _Dlg.Element.style.top = '20%';
      _Dlg.Element.style.left = '2%';
      _Dlg.Element.style.width = '94%';                
    }
    
    var __onKeyPress = function (e){      
      var KeyID = (window.event) ? event.keyCode : e.keyCode;        
      if (KeyID==27) _Dlg.BtnAcept.onclick();
      MAPA.cancelEvent(e);      
      return true;
    }
    MAPA.AddEvent(document,'keyup', __onKeyPress);
    _Dlg.Footer.style.textAlign = 'center';
    _Dlg.ShowButton(_Dlg.BtnAcept)
    _Dlg.BtnAcept.onclick = function(){ 
      MAPA.RemoveEvent(document,'keyup', __onKeyPress);
      setTimeout( function(){ delete MAPA.__OnTopDialog; }, 200 );         
      _Dlg.RemoveOnclose = true;  
      _Dlg.Close();  
      if(o.OnClose) o.OnClose();
      if(onclose) onclose();
    };   
    _Dlg.Body.className += ' error_image';
    _Dlg.Caption.style.backgroundColor = 'Red';
    _Dlg.Caption.style.color = 'White';
    if (o && MAPA.isString(o)){
     _Dlg.Body.innerHTML = '<div class="message"><div class="img"></div>' + o + '</div>'; 
    } else if(o.Message) {
     _Dlg.Body.innerHTML = '<div class="message"><div class="img"></div>' + o.Message + '</div>'; 
    }
    setTimeout(function(){_Dlg.BtnAcept.focus();},50)       
    if (__sp.y>0){
       return MAPA.__OnTopDialog =_Dlg.Show();
    }else{
      return MAPA.__OnTopDialog = _Dlg.Show().Center();
    }
  };
  
  that.ShowConfirm = function(o) {
    that.Show();
    //if(_Dlg) _Dlg.Close();
    var _Dlg = MAPA.Dialog({ Title: o.Title, CanMove: true, RemoveOnClose: true, Selectable : o.Selectable });
    var __sp = MAPA.GetScrollPositions();
    if (__sp.y>0){
      var __E = _Dlg.Element.style;
      __E.width = String.format('{0}px', o.Width);
      __E.height = String.format('{0}px', o.Height);
      __E.left = String.format('{0}px', (document.documentElement.clientWidth  /2) - (o.Width / 2));  
      __E.top = String.format('{0}px', (document.documentElement.clientHeight  /2) - (o.Height / 2) + __sp.y );      
    }else{
      _Dlg.Center2(o.Width || 400, o.Height || 150);
    }
    
    if($('mobileMenuHandler') && $('mobileMenuHandler').offsetHeight>0 && document.documentElement.clientWidth<321){              
      _Dlg.Element.style.top = '20%';
      _Dlg.Element.style.left = '2%';
      _Dlg.Element.style.width = '94%';                
    } 
     
    _Dlg.Footer.style.textAlign = 'center';
    _Dlg.ShowButton(_Dlg.BtnYes)(_Dlg.BtnNo);
    _Dlg.BtnYes.onclick = function() {
      if(o.BeforeConfirm){
        if(o.BeforeConfirm(_Dlg)) return;
      }
      _Dlg.RemoveOnclose = true;
      _Dlg.Close(); 
      if(o.OnConfirm) o.OnConfirm();
      if(o.OnTerminate) o.OnTerminate(_Dlg);       
    };
    _Dlg.BtnNo.onclick = function() {_Dlg.RemoveOnclose = true; _Dlg.Close(); if(o.OnCancel) o.OnCancel(); if(o.OnTerminate) o.OnTerminate(_Dlg);}; 
    _Dlg.Body.className += ' confirm_image';
    if (o.Message) _Dlg.Body.innerHTML = '<div class="message"><div class="img"></div>' + o.Message + '</div>';
    if (__sp.y>0){
      return _Dlg.Show(); 
    }    
    return _Dlg.Show().Center();
  };
  

  that.ShowMessage = function(o,onclose) {
    var __dlg =  that.ShowError(o,onclose);    
    __dlg.Caption.style.backgroundColor = '';
    __dlg.Caption.style.color = '';     
    __dlg.SetCaption(o.Caption || '');    
    __dlg.HideButton(__dlg.BtnNo);
    __dlg.Body.className = 'W1-Body info'; 
    if(o.css){
      __dlg.Body.querySelectorAll('.message div.img')[0].className += (' ' + o.css);     
    }
      
    return __dlg;
  };

  that.Hide = function() {        
    if (_Dlg) _Dlg.Close();
    _initLayer();
    _layer.style.display = 'none';
    var __form = document.getElementsByTagName('form')[0];
    if (__form) __form.disabled = false;
    return that;      
  };
  
  that.Dlg = function(){
    return _Dlg;
  }
  
  return that;
  
}();

MAPA.DialogHelper = function() {  
  var that = {};
  that.Dialogs = [];
  that.Remove = function(value) { that.Dialogs.remove(value); return that;};  
  that.Add = function(value) { that.Dialogs.add(value);  return that.ShowLast();};
  that.HideAll = function() { that.Dialogs.forEach(function(d) { d.Element.style.zIndex = 1000; });  return that;};
  that.ShowLast = function() { if (that.Dialogs.length>0){ that.Dialogs.lastItem().Element.style.zIndex = 10001; } ; return that; };
  
  that.ResizeConfigDialog = function(dlg){
    var __e = dlg.Element.style;
    if($('mobileMenuHandler') && $('mobileMenuHandler').offsetHeight>0){              
      __e.top = '20%'; __e.left = '5%'; __e.width = '90%'; __e.height = '18em';          
    }else{
      __e.top = '30%'; __e.left = '30%'; __e.width = '350px';__e.height = '180px';  
    }          
  }
  that.ResizeDialog = function(dlg,a,b){
    var __e = dlg.Element.style;
    if($('mobileMenuHandler') && $('mobileMenuHandler').offsetHeight>0){     
      var __sp = MAPA.GetScrollPositions();
       __e.top = (__sp.y>0) ? String.format('{0}px', (document.documentElement.clientHeight/4)  + __sp.y ) : b.Top || '20%'; 
      __e.left = '5%'; __e.width = '90%'; __e.height = b.Height || '18em';          
    }else{
      __e.top = a.Dialog.Top; __e.left = a.Dialog.Left; __e.width = a.Dialog.Width; __e.height = a.Dialog.Height;  
    }                  
  }
      
  return that;
} ()


MAPA.Dialog = function(o) {

  var that = {}
  that.RemoveOnclose = o.RemoveOnclose || false;
     
  var __onResize = function() { that.Element.style.left = String.format('{0}px', (document.documentElement.clientWidth  /2) - (that.Element.clientWidth / 2)); that.Element.style.top = String.format('{0}px', (document.documentElement.clientHeight / 2) - (that.Element.clientHeight / 2)); }

  that.Center2 = function(w, h) {
    var __E = that.Element.style;
    __E.width = String.format('{0}px', w);
    __E.height = String.format('{0}px', h);
    __E.left = String.format('{0}px', (document.documentElement.clientWidth  /2) - (w / 2));
    __E.top = String.format('{0}px', (document.documentElement.clientHeight / 2) - (h / 2));
  }
  that.OnButtonClick = o.OnButtonClick || function() { }
  that.HideButton = function(button) { button.style.display = 'none'; return that.HideButton; };
  that.ShowButton = function(button) { button.style.display = 'inline'; return that.ShowButton; };
  that.Center = function() { MAPA.RemoveEvent(window, 'resize', __onResize);MAPA.AddEvent(window, 'resize', __onResize); setTimeout(__onResize,1); return that; };  
  that.SetCaption = function(value) { that.Caption.innerHTML = value; return that; };
  that.Show = function() { that.Element.style.display = 'block';MAPA.DialogHelper.Remove(that).HideAll().Add(that);return that; }
  that.Hide = function() {  MAPA.RemoveEvent(window, 'resize', __onResize);that.Element.style.display = 'none';MAPA.DialogHelper.Remove(that).ShowLast();return that;  }
  that.Close = function() { that.Hide(); try { if (that.RemoveOnclose) document.body.removeChild(that.Element); } catch (er) { }; return that; } 
  that.HideLayer = function(){ MAPA.Layer.Hide() ;return that;};  

  that.Element = $.$('div', { className: 'W1', style: { top   : '35%', left  : '35%', width : '300px', height: '150px' }});                                               
  that.Caption = $.$('div', { className: 'W1-Caption' });
  that.Body = $.$('div', { className: 'W1-Body' });
  that.Footer = $.$('div', { className: 'W1-Footer' });
  that.Element.appendChild(that.Caption)
  that.Element.appendChild(that.Body)
  that.Element.appendChild(that.Footer)


  that.Footer.appendChild(that.BtnSave = $.$('input', { type: 'button', value: 'Grabar', className: 'btnSave' }));
  that.Footer.appendChild(that.BtnAcept = $.$('input', { type: 'button', value: 'Aceptar', className: 'btn' }));
  that.Footer.appendChild(that.BtnCancel = $.$('input', { type: 'button', value: 'Cancelar', className: 'btnCancel' }));
  that.Footer.appendChild(that.BtnYes = $.$('input', { type: 'button', value: 'Si', className: 'btnSi' }));
  that.Footer.appendChild(that.BtnNo = $.$('input', { type: 'button', value: 'No', className: 'btnNo' }));

  that.BtnCancel.onclick = function() { that.OnButtonClick(that.BtnCancel); };
  that.BtnSave.onclick = function() { that.OnButtonClick(that.BtnSave); };
  that.BtnAcept.onclick = function() { that.OnButtonClick(that.BtnAcept); };
  that.BtnYes.onclick = function() { that.OnButtonClick(that.BtnYes); };
  that.BtnNo.onclick = function() { that.OnButtonClick(that.BtnNo); };

  that.HideButton(that.BtnCancel)(that.BtnSave)(that.BtnAcept)(that.BtnYes)(that.BtnNo);
  document.body.appendChild(that.Element);
  if (o.CanMove) document.__DH.MakeDragable(that.Element);
  that.SetCaption(o.Title || '');
  that.Element.style.top = o.Top || that.Element.style.top;
  that.Element.style.left = o.Left || that.Element.style.left;
  that.Element.style.width = o.Width || that.Element.style.width;
  that.Element.style.height = o.Height || that.Element.style.height;
  if(!o.Selectable) that.Element.onselectstart = function(ev) { return MAPA.MapaEvent(ev).Target.type == 'text' || 
                                                     MAPA.MapaEvent(ev).Target.type == 'textarea';
                                                 }

  if(o.Content && MAPA.isString(o.Content)) that.Body.innerHTML = o.Content;
  if(o.Content && o.Content.tagName) that.Body.appendChild(o.Content); 
  return that;
}

MAPA.CreateStringBuilder = function(){
  var that = {};
  that.buffer = [];
  that.append = function(value) { that.buffer.push(value); return that;};
  that.clear = function(){ that.buffer = []; return that;};
  that.toString = function(separator){ return that.buffer.join(separator || '') };
  return that;
};

MAPA._KeyEvents = function(){
    var _that = { };      
    function __keyCheck(e){
      if(MAPA.__OnTopDialog) return;
      var __src  = MAPA.MapaEvent(e).Target;
      while(__src){
        if(__src.id=='SearchContainer') return; 
        __src = __src.parentNode;       
      }    
      var KeyID = (window.event) ? event.keyCode : e.keyCode;
      if( window.OnKeyPressHandler &&  window.OnKeyPressHandler(KeyID)) return; 
      if (KeyID==45 && window.ShowDlg) window.ShowDlg();
      if (KeyID==46 && window.Borrar) Borrar();            
    } 
    var _enabled = false;
    _that.EnableEvents = function(){
      if(!_enabled){
        MAPA.AddEvent(document,'keyup',__keyCheck)
        _enabled = true;        
      } 
      return _that;     
    }      
    _that.DisableEvents = function (){
      MAPA.RemoveEvent(document,'keyup',__keyCheck);
      _enabled = false;
      return _that;
    }
    var __dialog;
    var __handlers;
    var __onDlgKeyPress = function (e){ 
      if(!MAPA.__OnTopDialog ){
        var KeyID = (window.event) ? event.keyCode : e.keyCode;        
        if (KeyID==27 && __dialog)(__handlers && __handlers["27"] ? __handlers["27"] : __dialog.BtnCancel.onclick)();
        if (KeyID==13 && __dialog)(__handlers && __handlers["13"] ? __handlers["13"] : __dialog.BtnAcept.onclick)();
      }
      return _that;
    };     
    _that.EnableDialogEvents = function(dlg, o){
      __dialog = dlg;
      __handlers = o;
      MAPA.AddEvent(document,'keyup',__onDlgKeyPress)
      return _that;
    }
    _that.DisableDialogEvents = function(){
      __dialog=false;
      MAPA.RemoveEvent(document,'keyup',__onDlgKeyPress);
      return _that;
    }        
    return _that;
}()

MAPA.InitMobileMenuButtons = function(page, hideSearch){
  $('MobileButtonMenu').onclick = function(){ $('Menu1').style.display = $('Menu1').style.display == 'block' ? 'none' : 'block'; } 
  $('MobileButtonInfo').onclick = function(){ $('RToolBar1').style.display = $('RToolBar1').style.display == 'block' ? 'none' : 'block'; }
  $('MobileButtonHome').onclick = function(){ 
    document.location = page || '../default.aspx';  
  }
  $('MobileButtonSearch').style.display = hideSearch ? 'none' : '';
  $('MobileButtonSearch').onclick = function(){
      $('SearchContainer').style.position = 'relative';
      $('SearchContainer').style.cssFloat = 'left';
      $('SearchContainer').style.width = '100%';
      $('SearchContainer').style.height = 'inherit'; 
    if($('SearchContainer').style.display == 'block'){
      $('SearchContainer').style.display = 'none';
      _ToolBar.Buttons('TBar1-015').Hide();       
    }else{
      $('SearchContainer').style.display = 'block';
      _ToolBar.Buttons('TBar1-015').Show();
    }  
  }
  
  MAPA.AddEvent(window,'resize', function(){    
    if($('mobileMenuHandler') && $('mobileMenuHandler').offsetHeight==0){
     $('RToolBar1').style.display = $('Menu1').style.display='inherit'; 
    }else{
      $('RToolBar1').style.display = $('Menu1').style.display='none'; 
    }
  })

}

MAPA.BasicExport = function(){
  var that = {};  
  var _export = {};  
  that.ShowDialog = function(o){
      if(o.Table && o.Table.DataSet.length==0) return;
      var __itemsIds = o.Table ? o.Table.DataSet.map(function (e){ return e._id;}) : []; 
        
      var __setCurrentButton = function(current){
        ['btn_export_csv','btn_export_xml','btn_export_txt','btn_export_json'].forEach( function(id){$(id).className=''});
        current.className = 'current_button';       
      }
      function __setLineNumbers(lineContainer,text){
        var __lines = text.split('\n').map( function(l,i) { return '<span>{0}</span>'.format(String.leftPad( i+1,4,'0')) });
	      __lines.add('<br />')
        __lines.add('<br />')     	
        lineContainer.innerHTML =  __lines.join('') 
      }
      var ___Exportar = function(sender, format){
        _export.Last = sender;
        _export.LastFormat = format;  
        __setCurrentButton(sender)        
        $('previewMainContainer').style.backgroundImage = 'url(../img/bg-wait.gif)';
        $('previewLineContainer').style.display = $('previewContainer').style.display = 'none'; 
        $('previewLineContainer').onselectstart = function() { return false; };          
        $Ajax.Post(o.url, String.format('accion=export&mode={0}&ids={1}', 
                                       (format || "cvs"), 
                                       $('checkSeleccionados').checked ? o.SelectedIds.join('-') : __itemsIds.join('-')) , 
          function(o){
            $('previewMainContainer').style.backgroundImage = '';
            $('previewLineContainer').style.display = $('previewContainer').style.display = 'inherit';
            if(MAPA.isGecko) $('previewContainer').textContent = o;
            else             $('previewContainer').innerText = o;                               
           __setLineNumbers($('previewLineContainer'), o );
            return false;                                                                                                                                                           
        });
       return true; 
      }
      
      var ___openFile = function(){
        $('frmExportMode').value = _export.LastFormat;
        $('frmExportIds').value = $('checkSeleccionados').checked ? o.SelectedIds.join('-') : __itemsIds.join('-');
        $('frmExport').submit();
      }
      
      var __ShowDialog = function(){
        if(!_export.Dlg){
          _export.HtmlContent = $('ExportDialog');        
        }
        _export.Dlg =  MAPA.Layer.ShowConfirm({ Title          : _CONST.AppName, 
                                                Height         : document.getElementsByTagName('html')[0].clientHeight/1.3, 
                                                Width          : document.getElementsByTagName('html')[0].clientWidth/1.3,                           
                                                BeforeConfirm  : ___Exportar,
                                                OnCancel       : MAPA.Layer.Hide,
                                                OnTerminate    : function(){MAPA._KeyEvents.DisableDialogEvents().EnableEvents(); },
                                                Selectable     : true
                                              });
        _export.Dlg.Body.appendChild(_export.HtmlContent); 
        _export.Dlg.Body.style.backgroundImage = 'url(../img/tabla.png)';                                     
        _export.Dlg.Body.style.overflow = 'auto';                                                                 
        _export.Dlg.BtnNo.value = 'Cerrar'; 
        _export.Dlg.HideButton(_export.Dlg.BtnYes);
        _export.Dlg.BtnCancel.onclick =_export.Dlg.BtnNo.onclick;                                                                                                                      
        MAPA._KeyEvents.DisableEvents().EnableDialogEvents(_export.Dlg, { "27" : _export.Dlg.BtnNo.onclick });
        $('btn_export_csv').onclick  = function(){ ___Exportar(this, 'csv'); };
        $('btn_export_xml').onclick  = function(){ ___Exportar(this, 'xml'); };
        $('btn_export_txt').onclick  = function(){ ___Exportar(this, 'txt'); };
        $('btn_export_json').onclick = function(){ ___Exportar(this,'json'); };
        $('btn_export_file').onclick = function(){ ___openFile(); };       
        $('checkSeleccionadosContainer').style.display = o.SelectedIds.length>0 ? 'inherit' : 'none';
        $('checkSeleccionados').checked = o.SelectedIds.length>0; 
        $('checkSeleccionados').onclick = function(){ ___Exportar(_export.Last,_export.LastFormat); };        
      }      
      __ShowDialog();
      ___Exportar( $('btn_export_csv'),'csv');
    }

  var __graph;
  var __showChartPanel = function(){
    if(!MAPA.ChartDataProvider) return;
    if(__graph){
      __graph.Height = document.getElementsByTagName('html')[0].clientHeight * .68;
      __graph.Width  = document.getElementsByTagName('html')[0].clientWidth * .68;
      var __Dlg =  MAPA.Layer.ShowConfirm({ Title      : _CONST.AppName,
                                            Height     : __graph.Height, 
                                            Width      : __graph.Width,
                                            Message    : '' ,                            
                                            OnCancel   : MAPA.Layer.Hide,
                                            OnTerminate: function(){ MAPA._KeyEvents.EnableEvents().DisableDialogEvents(); }
                                          });
      MAPA._KeyEvents.DisableEvents().EnableDialogEvents(__Dlg, { "27" : __Dlg.BtnNo.onclick });  
      __Dlg.Body.appendChild(__graph.Canvas);
      __Dlg.BtnNo.value = 'Cerrar'; 
      __Dlg.HideButton(__Dlg.BtnYes);
      __Dlg.BtnCancel.onclick =__Dlg.BtnNo.onclick; 
      __graph.SeriesEnabled = false;
      __graph.dataSource = MAPA.ChartDataProvider(__graph);
      __graph.ChangeStyle(__graph.Style); 
      return;
    }

    MAPA.Include('../js/MAPA.Charts.js', function(){      
      __graph = MAPA.Charts({ Style   : 0, Width : 600, Height : 480,
                              Padding : [15, 20, 25, 35],                                   
                              Title   : '{0} - Gráfico de {1}'.format(_CONST.AppName, _CONST.Name),
                              LegendBox   : true,
                              LegendWidth : 0.33,
                              Colors      : MAPA.Serie(MAPA.Charts.prototype.createColors(30))
      });
      __graph.Events.OnClick.Add( function(name, position){ console.log('{0} - ({1},{2})'.format(name, position.x, position.y)); });
      __graph.Events.OnItemSelected.Add( function(name, e){ console.log('{0} - ({1},{2}) {3} {4}'.format(name, e.position.x, e.position.y, e.source, e.data.legend)); });
      __showChartPanel();
    });
  }
  MAPA.OnCtrlKeyPress(96, __showChartPanel)

  return that;
}()


MAPA.includes = [];
MAPA.Include = function(url, callback){
  if(MAPA.includes.indexOf(url.toLowerCase())>-1){
    if(callback) callback();
    return;
  }
  MAPA.includes.add(url.toLowerCase());
  var script = $.$('script', { type : 'text/javascript' })
  if (script.readyState){  
    script.onreadystatechange = function(){
      if(script.readyState=='loaded'||script.readyState=='complete'){
        script.onreadystatechange = null;
        if(callback) callback();
      }
    };
  }else{ script.onload = function(){if(callback) callback(); };}
  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}
 
 
function __FillTemplate(element, scope){

  function getValue(value,scope){ 
    if(!value) return undefined;
    var __object = scope || window;
    value.split(/\.|\[|\]/).forEach( function(token){
      if(token==='') return;
      __object=__object[token];
      if(__object===undefined) __object=window[token];
    });
    return __object;
  }

  function getDatasource(node) {
    node.attributes.xbind  
    if(node.attributes.xbind) return getValue(node.attributes.xbind.value);
    var __node = node.parentNode;     
    while(__node) {
      if(__node.attributes.xbind) return getValue(__node.attributes.xbind.value);      
      __node = __node.parentNode;
    }
    return window;
  } 


  var __root = element||document.body;
  var __elements = MAPA.toArray(__root.querySelectorAll('[xbind]'));
  __elements.forEach( function(child){
    child.attributes.xbind.value.split(';').forEach( function(token){
      var __tokens = token.split(':');
      var __converter = __tokens[1].trim().split(' ');  
      if(__converter[1]){
        var __value = getValue(__converter[0].trim(), scope || getDatasource(child));
        child[__tokens[0].trim()] = getValue(__converter[1].trim(), scope)(__value, __converter[2] );
      }else{      
        child[__tokens[0].trim()] = getValue(__converter[0].trim(), scope || getDatasource(child)) ;     
      }          
    });
  });
}

function __ExecuteTemplate(template,values){
  var __itemplate = $(template); 
  var __sb = MAPA.CreateStringBuilder();
  values.forEach(function (o) {
    var n = __itemplate.cloneNode(true);
    n.id = '';            
    __FillTemplate(n, o);
    __sb.append(n.outerHTML);            
  });
  return __sb.toString();
}