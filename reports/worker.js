
'use strict'; 

var __$__module_name = 'POL';

(function(module, name){

  var _module =  module[name] = { apply : function apply(o, c, d){
                                            if (d) apply(o, d);
                                            if (o && c && typeof c == 'object'){
                                            for (var p in c) o[p] = c[p];
                                            }
                                            return o;
                                          }};      
  // ========================================================================================
  // Utils
  // ========================================================================================
  (function(module){
    module.apply(module,{ 
      toArray     : function(v){return Array.prototype.slice.call(v); },
      isNull      : function(v){return v === null; },
      isArray     : function(v){return Array.isArray(v); },
      isString    : function(v){return typeof v == 'string';},
      isBoolean   : function(v){return typeof v == 'boolean';},
      isNumber    : function(v){return typeof v == 'number';},
      isFunction  : function(v){return typeof v == 'function';},
      isObject    : function(v){return v && typeof v == 'object';},
      clone       : function(o) {
        if(module.isArray(o))             return o.slice(0);
        if(module.isObject(o) && o.clone) return o.clone();
        if(module.isObject(o)){               
          return Object.keys(o).reduce( function(a, k){
            a[k] = module.clone(o[k]);
            return a;
          }, {});
        }
        return o;
      },        
      join        : function(items, property, separator){
        return items.reduce(function(a, o){ return a.append(o[property || 'id']); }, [])
                    .join(separator === undefined ? '-' : (separator || '')); 
      },
      stringBuilder : function(s){
          return { value      : s || '',
                    append     : function(s){ this.value = this.value + s; return this;},
                    appendLine : function(s){ this.value = this.value + (s || '') + '\n'; return this;}}
      }
    });
  }(_module));
  // ========================================================================================
  // Strings
  // ========================================================================================
  (function(module){
    module.apply(String, {
      stringBuilder : module.stringBuilder,
      leftPad       : function (val, size, ch) {
        var result = '' + val;
        if (ch === null || ch === undefined || ch === '') ch = ' ';            
        while (result.length < size) result = ch + result;            
        return result;
      },
      trimValues : function (values){ return values.map(function(s){return s.trim();});}
    });
    module.apply(String.prototype, {
      replaceAll  : function(pattern, replacement) { return this.split(pattern).join(replacement); },
      repeat      : String.prototype.repeat     || function(a) { return new Array(a + 1).join(this); },
      contains    : String.prototype.includes   || function(t, start) { return this.indexOf(t) >= (start || 0); },
      startsWith  : String.prototype.startsWith || function(t){ return this.indexOf(t) == 0; },                             
      toFloat     : function(){ return this.trim().replaceAll('.', '').replaceAll(',', '.') },
      fixDate     : function(){ return this.split(' ')[0]; },
      fixTime     : function(){ return this.split(' ')[1]; },
      fixYear     : function(){ return this.fixDate().split('/')[2];},
      trimSeconds : function(){ return this.split(':')[0] + ':' + this.split(':')[1] ; },
      paddingLeft : function(paddingValue){ return (paddingValue + this).slice(-paddingValue.length); },
      format      : function(){
        var __arg     = arguments;
        var __context = __arg[__arg.length - 1] || self;   
        return this.replace(/\{(\d+|[^{]+)\}/g, function(m, key){
          if(key.indexOf(':') > 0){
            var __fn = key.split(':');
            __fn[0]  = getValue(__fn[0], __context);
            __fn[1]  = getValue(__fn[1], __context);
            return __fn[0](__fn[1], __context);            
          }
          return /^\d+$/.test(key) ? __arg[key]
                                   : (typeof __context[key] === "undefined") ? getValue(key, __context)
                                                                             : __context[key]; 
        });
      }
    });      
  }(_module));      
  // ========================================================================================
  // Array
  // ========================================================================================    
  (function(module){
    module.apply(Array.prototype, {          
      remove   : function(o) {
        var index = this.indexOf(o);
        if (index != -1) this.splice(index, 1);
        return this;
      },
      add      : function(o) {
        this.push(o);
        return o;
      },
      append   : function(o) {
        this.push(o);
        return this;
      },
      item     : function(propName, value, def){
        return arguments==1 ? this.filter( function(v){return v['id'] == propName || v['_id'] == propName})[0] || def
                            : this.filter( function(v){return v[propName] == value})[0] || def;
      },
      contains : function(propName,value){ return this.item(propName,value); },
      lastItem : function() { return this[this.length - 1]; },
      select   : function(sentence){ return this.map(sentence) },   
      where    : function(sentence){ 
        if(module.isFunction(sentence)) return this.filter(sentence);
        if(module.isObject(sentence)){
          return this.filter(new Function('a', Object.keys(sentence)
                                                     .reduce(function(a, p, i){
                                                               return a + (i > 0 ? ' && ' : '')
                                                                        + ((sentence[p] instanceof RegExp) ? '{1}.test(a.{0})'.format(p, sentence[p])
                                                                                                           : 'a.{0} == \'{1}\''.format(p, sentence[p]));                                         
                                                             }, 'return ')));
        }
        return this;
      },
      sortBy      : function(propname, desc){
        var __order = [];
        var __names = propname.split(',').map( function(token,i){ 
          var __pair = token.split(' ');
          __order[i] = (__pair[1] && (__pair[1].toUpperCase()=='DESC')) ? -1 : 1;      
          return __pair[0];    
        });
        var __len   = __names.length;
        __order[0] = (__len==0 && desc ? -1 : __order[0])
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
      orderBy     : function(sentence){
        var __sentence = sentence;    
        if(module.isString(sentence)) __sentence = function(a){ return a[sentence]; }
        return this.map(function(e){return e})
                   .sort(function(a, b){
                      var x = __sentence(a);
                      var y = __sentence(b);
                      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                   });     
      },
      distinct    : function(selector) {
        var r = [];
        this.forEach(function(item){
          var _value = selector(item);
          if(r.indexOf(_value)==-1) r.push(_value);
        });
        return r;
      },
      groupBy : function(prop){
        return this.reduce(function(groups, item) {
          var val = item[prop];
          (groups[val] = groups[val] || []).push(item);
          return groups
        }, {})
      }
    });       
  }(_module));

  // =================================================================================================
  // Templates
  // =================================================================================================
  (function(module){

    function getValue(key, scope) {        
      return key.split(/\.|\[|\]/)
                .reduce( function(a, b){
                  if (b === '') return a;
                  return a[b] === undefined ? (a === self ? '' : self) : a[b];
                }, scope || self );    
    }
   
    function merge(template, o, key) {
      if(self.BS.reportDefinition.context.mergeMode){
        return mergeOptimized(template, o, key);
      }
      var __result = template.replace(/{([^{]+)?}/g, function (m, key) {
                      if(key.indexOf(':') > 0){
                        var __fn = key.split(':');                       
                        __fn[0]  = getValue(__fn[0], o);
                        __fn[1]  = getValue(__fn[1], o);                        
                        return __fn[0](__fn[1], o);            
                      }
                      var r   = getValue(key, o);
                      var __k = (key.contains('.') ? '' : 'o.') + key;
                      if (typeof (r) == 'function'){                        
                        return r(o);
                      }else{                        
                        return r;
                      }                    
                      return typeof (r) == 'function' ? r(o) : r;
                    });     
      return __result;
    }

    function mergeOptimized(template, o, key) {
      
      if(o[key] && o[key] === 'template') return template; 
      if(o[key]) return o[key](o);      
      var __values = [];
      var __result = template.replace(/{([^{]+)?}/g, function (m, key) {
                      if(key.indexOf(':') > 0){
                        var __fn = key.split(':');
                        var __k = (__fn[1].contains('.') ? '' : 'o.') + __fn[1];
                        __values.push('{0}({1}) '.format(__fn[0], __k));
                        __fn[0]  = getValue(__fn[0], o);
                        __fn[1]  = getValue(__fn[1], o);                        
                        return __fn[0](__fn[1], o);            
                      }
                      var r   = getValue(key, o);
                      var __k = (key.contains('.') ? '' : 'o.') + key;
                      if (typeof (r) == 'function'){
                        __values.push('{0}(o)'.format(__k));
                        return r(o);
                      }else{
                        __values.push('{0}'.format(__k));
                        return r;
                      }                    
                      return typeof (r) == 'function' ? r(o) : r;
                    });
      if(key && __values.length === 0){
        o[key] = 'template';
        return template;
      }
      if(key && __values.length){
        __values.reverse()
        var __b = template.split(/{([^{]+)?}/g)
                          .map(function(t, i){ 
                            return  i % 2 ? __values.pop() : '\'' + t + '\'' ; 
                          })                          
                          .reduce( function(a, token, i, arr){                            
                            if(token === "''") return a;
                            return a + token + ((i < arr.length-1) ? ' + ' : '');                               
                          }, 'return ');

        o[key] = new Function('o', __b.replace(/(?:\r\n|\r|\n)/g, ''));
        return o[key](o);
      }      
      return __result;
    }
    
    module.templates = { getValue  : getValue,
                         merge     : merge };

  }(_module));

  // =================================================================================================
  // Ajax
  // =================================================================================================
  (function(module){  
    module.ajax = {};
    module.apply(module.ajax, {
      get  : function (url, callBack) {
        url += (url.contains('?') ? '&ms=' : '?ms=') + new Date().getTime();
        var xml = this.createXMLHttpRequest();
        xml.open('GET', url, true);
        xml.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
        xml.setRequestHeader('Cache-Control', 'no-cache');
        xml.onreadystatechange = function () { if (xml.readyState == 4) callBack(xml.responseText) };
        xml.send(null);
      },
      post : function(url, params, callBack) {                                          
        var xml = this.createXMLHttpRequest();
        xml.open('POST', url, true);
        xml.onreadystatechange = function() { if (xml.readyState == 4) callBack(xml.responseText) };
        xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset:ISO-8859-1');
        xml.send(params);
      },
      callWebMethod : function(url, params, callBack) {
        var xml = this.createXMLHttpRequest();
        xml.open('POST', url, true);
        xml.onreadystatechange = function(){ if (xml.readyState == 4) callBack(xml.responseText) };
        xml.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xml.send(params);
      },
      createXMLHttpRequest : function(){ return new XMLHttpRequest(); }
    });  
  }(_module)); 
      
  // =================================================================================================
  // Tabbly
  // =================================================================================================
  (function (module){
      
    var __context;

    function __ExecuteCode(code){

      __context = { sections : [], groups : [], details : []};

      var __cur;
      var __func       = '';
      var __funcBody   = '';
      var __setState  = false;

      function __get(value){
        if(value && value.trim().startsWith('@')){
          return __context[value.trim().split('@')[1].trim()] || '';
        }else if(value){
          return value.trim();
        }
        return '';
      }  

      function __parse_properties(value){
        var __reg   =  /([a-zA-Z0-9_\-]*)\s*:\s*('[^']*'|[^\s]*)/g;
        var __o     = {};
        var __match = __reg.exec(value);
        while (__match != null) {
          __o[__match[1].trim()] = __get(__match[2].trim().replace(/^'([^']*)'$/g, '$1'));
          __match = __reg.exec(value);
        }
        return __o
      }

      function __parseLine(l, o){
        if(!__func && !l.trim()) return function(){};
        var __keys = /DEFINE|#|CREATE|SET|FUNCTION|END/;
        if(__keys.test(l)){
          if(/^#/.test(l)){
            return function(){};
          }else if(/^SET (\w.*)/.test(l)){  
            var __tokens = l.match(/^SET (\w.*)$/);
            __setState = true;
            __func      = __tokens[1].trim();
            __funcBody  = '';
            return function(){};
          }else if(/^FUNCTION (\w.*)/.test(l)){  
            var __tokens = l.match(/^FUNCTION (\w.*)$/);
            __setState  = false;
            __func       = __tokens[1].trim();
            __funcBody   = '';
            return function(){};
          }else if(/^END/.test(l)){      
            var __body = __funcBody;
            var __name = __func;
            __func = __funcBody = ''; 
            if(__setState){
              __setState = false;
              return function(){            
                return function(ctx){ __cur[__name] = __body.trim(); }
              }();
            }else{
              return function(){            
                return function(ctx){ ctx[__name] = new Function('ctx', __body); }
              }();
            }                 
          }else if(/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)){
            var __tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
            return function(){ 
              var tokens = __tokens;
              return function(ctx){ ctx[tokens[1].trim()] = tokens[2].trim(); }
            }();
          }else if(/^CREATE\s\s*(\w*) (.*)$/.test(l)){
            var __tokens = l.match(/^CREATE\s\s*(\w*) (.*)$/);
            if(__tokens[1]=='section'){
              return function(){ 
                var tokens = __tokens;
                return function(ctx){ 
                  ctx.sections.push(__parse_properties(tokens[2])); 
                  __cur = ctx.sections[ctx.sections.length - 1];}
              }();
            }
            else if(__tokens[1]=='group'){
              return function(){ 
                var tokens = __tokens;
                return function(ctx){ 
                  ctx.groups.push(__parse_properties(tokens[2]));
                  __cur = ctx.groups[ctx.groups.length - 1];}
              }();
            }else if(__tokens[1]=='detail'){
              return function(){ 
                var tokens = __tokens;
                return function(ctx){
                  ctx.details.push(__parse_properties(tokens[2]));
                  __cur = ctx.details[ctx.details.length - 1];}
              }();
            }
          }else{ throw new Error('Tabbly : Unrecognized text after DEFINE')}  
        }else{ 
          if(__func){
            __funcBody += o;
            __funcBody += '\n';
            return function(){};
          }
          throw new Error('Tabbly : Unrecognized text')
        }
      }

      code.split('\n').forEach(function(l){ 
        __parseLine(l.trim(),l)(__context); 
      });

      return { context : __context };

    }

    module.tabbly = { execute : __ExecuteCode };

  }(_module));
      
  // =================================================================================================
  // Reports
  // =================================================================================================
  (function(module) {

    module.ReportEngine                = {};      
    module.ReportEngine.generateReport = function(rd, data, mediator){
      var __rd      = rd || module.ReportEngine.rd;
      // ===========================================================================================
      // Transformar los datos
      // ===========================================================================================
      var __dataSet = __rd.context.parseData ? __rd.context.parseData(__rd, data, mediator.message)
                                             : data;
      mediator.message({ type : 'report.status', text : 'Inicializando...', value : 0.0 });
      console.time('Render');
      // ===========================================================================================
      // Inicializar funciones para la generación de contenido personalizado
      // ===========================================================================================
      function __initContentProviders(){
        [__rd.context.sections, __rd.context.details, __rd.context.groups]
        .reduce(function(a,b){ return a.concat(b); }, [])
        .map(function(s){
          if(s.valueProviderfn){
            s.valueProvider = module.templates.getValue(s.valueProviderfn, self); 
            delete s.valueProviderfn;             
          }
          if(s.footerValueProviderfn){
            s.footerValueProvider = module.templates.getValue(s.footerValueProviderfn, self); 
            delete s.footerValueProviderfn; 
          }
          if(s.headerValueProviderfn){
            s.headerValueProvider = module.templates.getValue(s.headerValueProviderfn, self); 
            delete s.headerValueProviderfn;
          }  
        });
      }
      // ===================================================================================================
      // Generación de las secciones de cabecera de las agrupaciones
      // ===================================================================================================
      var __MERGE_AND_SEND = function(t, p, fnkey){ mediator.send(module.templates.merge(t, p, fnkey)); };
      function __groupsHeaders(){
        __groups.forEach(function(g, ii){
          if(ii < __breakIndex) return; 
          mediator.message({ type : 'report.sections.group.header', value : g.id });  
          if(g.definition.header) return __MERGE_AND_SEND(g.definition.header, g, 'compiled_headerfn');
          if(g.definition.headerValueProvider) return mediator.send(g.definition.headerValueProvider(g)); 
        });    
      }
      // ===================================================================================================
      // Generación de las secciones de resumen de las agrupaciones
      // ===================================================================================================
      function __groupsFooters(index){
        var __gg = __groups.map(function(g){return g;}); 
        if(index) __gg.splice(0, index);
        __gg.reverse().forEach( function(g){
          mediator.message({ type : 'report.sections.group.footer', value : g.id });          
          if(g.definition.footer) return __MERGE_AND_SEND(g.definition.footer, g, 'compiled_footerfn');
          if(g.definition.footerValueProvider) return mediator.send(g.definition.footerValueProvider(g));
        }); 
      } 
      // ===================================================================================
      // Generación de las secciones de detalle
      // ===================================================================================
      function __detailsSections(){
        __details.forEach(function(d){
          mediator.message({ type : 'report.sections.detail', value : d.id });
          if(d.template) return __MERGE_AND_SEND(d.template, d, 'compiledfn')
          if(d.valueProvider) return mediator.send(d.valueProvider(d));
        })            
      }
      // ===================================================================================
      // Generación de las secciones de total general
      // ===================================================================================
      function __grandTotalSections(){
        __totals.forEach(function(t){
          mediator.message({ type : 'report.sections.total', value : t.id });
          if(t.template) return __MERGE_AND_SEND(t.template, t, 'compiledfn')
          if(t.valueProvider) return mediator.send(t.valueProvider(t));
        })            
      } 
      // ===================================================================================
      // Generación de las secciones de cabecera del informe
      // ===================================================================================
      function __reportHeaderSections(){
        __headers.forEach(function(t){
          mediator.message({ type : 'report.sections.header', value : t });
          if(t.template) return __MERGE_AND_SEND(t.template, t, 'compiledfn')
          if(t.valueProvider) return mediator.send(t.valueProvider(t));
        })            
      } 
      // ===================================================================================
      // Inicializar el objeto que sirve de acumulador
      // ===================================================================================
      function __resolveSummaryObject(){
        var __summary = JSON.parse(__rd.context.summary || '{}');
        if(__rd.context.onInitSummaryObject) return __rd.context.onInitSummaryObject(__summary);      
        return __summary;
      }

      var __breakIndex = -1; 

      var __summary    = __resolveSummaryObject();
      var __headers    = (__rd.context.sections || []).where({ type : 'header' });
      var __totals     = (__rd.context.sections || []).where({ type : 'total' });
      var __footers    = (__rd.context.sections || []).where({ type : 'footer' });
      var __details    = __rd.context.details || [];
      var __groups     = __rd.context.groups 
                                     .map(function(g, i){
                                          return {  name       : 'G' + (i+1),
                                                    rd         : __rd,
                                                    definition : g,
                                                    current    : '', 
                                                    data       : module.clone(__summary),                         
                                                    init : function(value){
                                                            var __k = value[this.definition.key].toString();
                                                            var __Gx = self.BS[this.name];
                                                            __Gx.all[__k] = __Gx.all[__k] || [];
                                                            __Gx.all[__k].push(value);
                                                            __Gx.recordCount = 1;
                                                            if(this.__resume === false) return;
                                                            if(this.__resume){
                                                              module.ReportEngine.copy(value, this.data);
                                                              return
                                                            }
                                                            if(this.__resume = Object.keys(this.data).length > 0)                                                                                                                        
                                                              module.ReportEngine.copy(value, this.data); 
                                                    },
                                                    sum  : function(value){ 
                                                            var __k = value[this.definition.key].toString();
                                                            var __Gx = self.BS[this.name]; 
                                                            __Gx.all[__k] = __Gx.all[__k] || [];
                                                            __Gx.all[__k].push(value);
                                                            __Gx.recordCount += 1;
                                                            if(this.__resume === false) return;
                                                            module.ReportEngine.sum(value, this.data);
                                                    }, 
                                                    test : function(value){ 
                                                              return value[this.definition.key] == this.current;
                                                    }}           
                                    }) || [];                                   
      self.BS = { reportDefinition : __rd, mediator : mediator };              
      // ==============================================================================================
      // Ordenar los datos
      // ==============================================================================================
      if(__rd.context.iteratefn){
        mediator.message({ type : 'report.status', text : 'Inicializando elementos...', value : 0.0 });
        __dataSet.forEach(__rd.context.iteratefn);
      }
      if(__rd.context.orderBy){
        mediator.message({ type : 'report.status', text : 'Ordenando datos...', value : 0.0 });
        __dataSet.sortBy(__rd.context.orderBy, false);
      }
      // ==============================================================================================
      // Inicializar
      // ==============================================================================================
      self.BS = { recordCount      : 0, 
                  G0               : module.clone(__summary),
                  dataSet          : __dataSet,
                  reportDefinition : __rd, 
                  mediator         : mediator };
      __groups.forEach( function(g, i){                   
        g.current = (__dataSet && __dataSet[0]) ? __dataSet[0][g.definition.key] : '';
        self.BS[g.name] = { recordCount : 0, all : {} };
      });
      if(__rd.context.onStartfn) __rd.context.onStartfn(self.BS);
      __initContentProviders();
      mediator.message({ type : 'report.status', value : 0.0 });
      // ==============================================================================
      // Cabeceras del informe
      // ==============================================================================
      __reportHeaderSections();
      // ==============================================================================
      // Cabeceras iniciales
      // ==============================================================================
      if(__dataSet.length > 0) __groupsHeaders(); 
      // ==============================================================================
      // Iterar sobre los elementos
      // ==============================================================================
      __dataSet.forEach(function(r, i){ 
        // ============================================================================
        // Procesar el elemento
        // ============================================================================         
        self.BS.recordCount++;
        self.BS.isLastRow        = __dataSet.length === self.BS.recordCount;
        self.BS.isLastRowInGroup = self.BS.isLastRow;
        self.BS.percent      = (self.BS.recordCount/__dataSet.length) * 100;  
        self.BS.previous     = self.BS.data || r;
        self.BS.data         = r; 
        __groups.forEach( function(g, i){ 
          self.BS[g.name].data  = Object.create(g.data);
        }); 
        module.ReportEngine.sum(r, self.BS.G0);        
        if(__rd.context.onRowfn) __rd.context.onRowfn(self.BS);
        mediator.message({ type  : 'report.status', 
                           text  : self.BS.percent.toFixed(1) + ' %', 
                           value : self.BS.percent });
        // ============================================================================
        // Determinar si hay cambio en alguna de las claves de agrupación
        // ============================================================================
        if(__groups.every( function(g){ return g.test(r) })){
          __groups.forEach( function(g){ g.sum(r); });               
        }else{                                                                        
          __groups.some( function(g, i){              
            if(!g.test(r)){
              __breakIndex = i;
              // ============================================
              // Pies de grupo de los que han cambiado
              // ============================================
              __groupsFooters(__breakIndex);
              // ============================================
              // Actualizar los grupos
              // ============================================
              __groups.forEach( function(grupo, ii){         
                if(ii >= __breakIndex){
                  // ========================================
                  // Inicializar los que han cambiado
                  // ========================================
                  grupo.init(r)
                  __breakIndex = i;
                }else{
                  // ========================================
                  // Acumular valores de los que siguen igual
                  // ========================================
                  grupo.sum(r);
                }                  
              });                                                                                   
              return true;
            }                      
            return false; 
          })
          // ====================================================================
          // Notificar del evento onGroupChange
          // ====================================================================
          __groups.forEach(function(g){
            g.current = r[g.definition.key];
          });
          if(__rd.context.onGroupChangefn) __rd.context.onGroupChangefn(self.BS);          
          mediator.message({ type  : 'report.sections.group.change', 
                             value : '__groups' });
          // =======================================================
          // Cabeceras
          // =======================================================
          __groupsHeaders();                              
        }                 
        // ============================================================
        // Determinar si este es el último elemento de la agrupación 
        // ============================================================;
        if(__groups.length && !self.BS.isLastRow ){
          var __next               = __dataSet[self.BS.recordCount];          
          self.BS.isLastRowInGroup = ! __groups.every( function(g){
            var __k = g.definition.key;
            return __next[__k] === self.BS.data[__k];
          });
        }
        // ============================================================
        // Secciones de detalle
        // ============================================================
        __detailsSections()            
      });

      if(__dataSet.length > 0){ 
        self.BS.previous = self.BS.data;
        // =============================
        // Pies de grupo
        // =============================
        __groupsFooters();
      }
      // ===================================================
      // Total general
      // ===================================================
      __grandTotalSections();
      mediator.message({ type : 'report.end', value : '' });
      mediator.flush();
      console.timeEnd('Render');
    }
          
    module.ReportEngine.copy    = function(s, d){ Object.keys(d).map(function(k){ d[k] = s[k];});}                                                                                 
    module.ReportEngine.sum     = function(s, d){ Object.keys(d).map(function(k){ d[k] += s[k];});}   
    module.ReportEngine.compute = function(ds, name){ return ds.reduce( function(t, o){ return t + o[name]; }, 0.0); }
    module.ReportEngine.group   = function(a, c){
	    var ds = a;
	    var __f = function(k, t){
	      ds.distinct( function(v){ return v[k]; })	            
	        .forEach ( function(v){ c[v] = ds.reduce( function(p, c, i, a){ return (c[k]==v) ? p + c[t] : p; }, 0.0); });
        return __f;	           
	    }
	    return __f;
	  }
 
  })(_module);
}(self, __$__module_name));


function __loadAndRender(o){
  var mediator = (function(){
                    var __data = [];
                    return {send : function(data){
                                     if(data !== ''){
                                       __data.push({ value : data });
                                       if(__data.length > 20) this.flush();              
                                     }
                            },
                            message : function(message){ postMessage(JSON.stringify(message)); },
                            flush   : function(){ __data = __data.reduce(function(a, d){ postMessage(JSON.stringify(d)); return a;}, []); }};
                  })();
  var msg      = mediator.message;
  var module   = self[__$__module_name];
  var cacheBreaker = '?t=' + new Date().getTime();

  msg({ type  : 'report.status', 
        text  : 'Cargando informe...'}),
        importScripts(o.report.source + cacheBreaker);      
  
  msg({ type  : 'report.status',
        text  : 'Solicitando datos...'});

  function __handleResponse(o){
    msg({ type  : 'report.status', 
          text  : 'Generando...'}),
          module.ReportEngine.generateReport('', JSON.parse(o), mediator);  
  }
  
  if(o.report.method && o.report.method === 'get'){
    module.ajax.get(o.report.data, __handleResponse);
  }else{
    module.ajax.post(o.report.data, '', __handleResponse)
  }
    
}

onmessage = function(e){
  
  if(e.data.action === 'load-report') { __loadAndRender(e.data);}

}
