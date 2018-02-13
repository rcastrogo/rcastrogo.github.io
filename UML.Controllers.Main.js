/// <reference path="core/Pol.Core.js" />
/// <reference path="core/Pol.Core.Game.js" />
/// <reference path="core/Pol.Core.Drawing.js" />


Pol.createNamespace('UML.Commands', this);

// ==============================================================
//
// UML.StateControllers.CreditsController
//
// ==============================================================
UML.StateControllers.MainController = function(){
  
  var _time   = 0;
  var _states = Pol.Core.StateManager();  
  var _fadeControler;    
  var _InputManager;    
  var _cm;

  var Tools = { Actor   : { name : 'Actor' }, 
                Use     : { name : 'Use case' }, 
                Pointer : { name : 'Pointer' }, 
                Link    : { name : 'Link' }
              };
  Tools.Current = Tools.Pointer;
  var _target;  
  var _document = {
    actors    : [],
    uses      : [],
    links     : [],
    name      : '',
    drag      : false
  } 

  var _that       = { Update      : function(dt) { _time += dt; _states.state.update(dt); },
                      Draw        : function(ctx){ _states.state.draw(ctx); },
                      Deactivate  : function()  {},
                      Activate    : function(o) { 
                        if(!_InputManager){ 
                          _InputManager = Pol.Core.Game.InputManager;                          
                        }                         
                        _states.setState('enter');
                        _cm = Pol.Core.CommandManager(_document);
                      }};
     
  // =============================================================================================================================================
  // 
  //  Enter
  // 
  // =============================================================================================================================================
  _states.enter.activate = function()   { _fadeControler = new Pol.Core.Game.FadeControler(500).fadeUp( function(){ _states.setState('idle');} ); };
  _states.enter.update   = function(dt) { _fadeControler.update(dt); };
  _states.enter.draw     = function(ctx){
    ctx.globalAlpha = _fadeControler.value/100;   
    __draw(ctx); 
    ctx.globalAlpha = 1; 
  };  

  // =============================================================================================================================================
  // 
  //  Leave
  // 
  // ============================================================================================================================================= 
  _states.leave.activate = function(o)  { };
  _states.leave.update   = function(dt) { };
  _states.leave.draw     = function(ctx){ }; 

  // =============================================================================================================================================
  // 
  //  Idle
  // 
  // =============================================================================================================================================
  _states.idle.activate = function(){
    $('toolbar').style.display = 'block';
    $('footer').style.display = 'block';

    $('btn-open').onclick  = __show_open_dialog;
    $('btn-save').onclick  = __saveDocument;

    $('btn-clear').onclick = __btn_clear;
    $('btn-undo').onclick  = _cm.undo;
    $('btn-redo').onclick  = _cm.redo;
    $('btn-import').onclick  = __show_parseText_dialog;
    $('btn-config').onclick  = __show_config_dialog;

    $('btn-repo').onclick  = __show_repository_dialog;;
    $('btn-edit').onclick  = __btn_edit;
    $('btn-tool-pointer').onclick  = __btn_toolPointer;
    $('btn-tool-actor').onclick  = __btn_toolActor;
    $('btn-tool-useCase').onclick  = __btn_toolUseCase;
    $('btn-tool-link').onclick  = __btn_toolLink;

    $('btn-delete').onclick  = __btn_delete;
    Pol.Core.Game.refresh();
    CreateAll(_document);
    __btn_toolPointer();
  };

  _states.idle.update   = function(dt){
    
    if(Tools.Current == Tools.Pointer){ return update_mode_pointer(dt);}
    if(Tools.Current == Tools.Actor){ return update_mode_actor(dt);}
    if(Tools.Current == Tools.Use){ return update_mode_use(dt);}
    if(Tools.Current == Tools.Link)   { return update_mode_link(dt); }   
        
    //var __Data = _InputManager.Data;                   
    //if(__Data.EndTap){ } 
    //if(__Data.Move){  }
  };
  _states.idle.draw = function(ctx){
    __draw(ctx);             
  };  
  
  function getObjectAt(data){
    return Pol.Core.Game.Collision.FindAt(_document.actors, data, 'bounds') ||
           Pol.Core.Game.Collision.FindAt(_document.uses, data, 'bounds');
  }
  
  function update_mode_link(dt){
    var __data = _InputManager.Data;
    var __resetTarget = function(newTarget, selected){
      if(_target) _target.selected = false;
      _target = newTarget;
      if(_target) _target.selected = selected || false;
    }
    if(__data.Tap && __data.Button == 0){
      var __target = getObjectAt(__data);
      if (__target){
        if(__target===_target)                  return __resetTarget();          
        if(__target.__type==='actor')           return __resetTarget(__target, true);
        if(__target.__type==='use' && !_target) return __resetTarget(__target, true);
        if(__target.__type===_target.__type)    return __resetTarget(__target, true);         
        if(!_document.links.some( function(l){ return l.from === _target && l.to ===  __target; })){
          _cm.executeCommad(UML.Commands.CreateLink(_target, __target));         
        }  
      }      
    }
  }

  function update_mode_pointer(dt){

    var __resetTarget = function(newTarget){     
      if(_target) _target.selected = false;
      _target = newTarget;
      if(_target && _document.__txt_ui) _document.__txt_ui();
    }

    var __data = _InputManager.Data;   
    if(__data.Tap) _document.drag = false;
    if(__data.Tap && __data.Button != 0 && _target) return __resetTarget();    
    if(__data.Tap && __data.Button == 0){
      var __newTarget = getObjectAt(__data);
      if(!__newTarget){
        return  __resetTarget();
      }
      if(_target != __newTarget){                    
        __resetTarget(__newTarget);
        _target.selected = true;          
      }      
    }

    if(__data.EndTap && _target && _document.drag){
      var __d = Pol.Core.Math.Vector2.distanceSquared(_target.center, _target._center);
      if(__d>0)_cm.executeCommad(UML.Commands.MoveEntity(_target));              
      _document.drag = false;
    }     

    if(__data.Move && _target){
      if(!_document.drag){
        _document.drag = true;
        _target._center = Pol.clone(_target.center); 
      }      
      _target.center.x = _target._center.x - __data.Delta.x;
      _target.center.y = _target._center.y - __data.Delta.y;            
    }

  }

  function update_mode_actor(dt){
    var __data = _InputManager.Data;
    if(__data.Tap && __data.Button == 0){
      var __options = { x : __data.x, y : __data.y, text : $('txtValue').value || 'Actor' };
      _cm.executeCommad(UML.Commands.AddActor(__options));                            
    }
  }

  function update_mode_use(dt){
    var __data = _InputManager.Data;
    if(__data.Tap && __data.Button == 0){
      var __options = { x : __data.x, y : __data.y, text : $('txtValue').value || 'Use case' };
      _cm.executeCommad(UML.Commands.AddUseCase(__options));                            
    }
  }
  
  // ==================================================================
  //  Toolbar 
  // ==================================================================
  function __resetDocument(){
    _document.actors = [];
    _document.uses   = [];    
    _document.links  = [];
    _document.name   = '';
    _cm.clear();   
  }
  
  function __btn_clear(){
    var __dlg = Pol.Dialogs.show('Borrar diagrama', '¿Está seguro de borrar el diagrama?',
                                 Pol.Dialogs.centerLayout(300, 180));
    __dlg.btnCancel.onclick = Pol.Dialogs.close;
    __dlg.btnOk.onclick     = function(){
      __resetDocument();
      Pol.Dialogs.close();
    }
  }

  function __btn_edit(){
    var ___tool_bar = function(fn){
      fn([$('btn-open'), $('btn-save'), $('btn-clear') , $('btn-delete'),
          $('btn-undo'), $('btn-redo'), $('btn-import'), $('btn-config'), $('btn-redo'),
          $('btn-tool-link'), $('btn-tool-useCase'), $('btn-tool-actor'),
          $('btn-tool-pointer'), $('btn-edit'), $('btn-repo')]);
    }
    var ___txt_ui = function(fn){
      fn([$('btn-ok'), $('btn-cancel'), $('txtValue')]);
    }
    var __restore_UI = function(){
       $('txtValue').value = '';
      ___tool_bar(Pol.show);
      ___txt_ui(Pol.hide);
      delete _document.__txt_ui;
    }
    var ___sync_text = function(){
      $('txtValue').value = _target.text;
      $('txtValue').focus();
    }
    if(_target){
      _document.__txt_ui = ___sync_text;
      ___txt_ui(Pol.show);
      ___tool_bar(Pol.hide);
      ___sync_text();
      $('btn-ok').onclick = function(){ 
        _cm.executeCommad(UML.Commands.ChangeText(_target, $('txtValue').value));
        __saveEntity(_target, $('txtValue').value);
      }
      $('btn-cancel').onclick = __restore_UI;
    }
  }
  function __saveEntity(target, text){
    var __data = { name : '{0}#{1}'.format(target.__type, target.text.toLowerCase()), 
                   text : target.text, 
                   type : target.__type == 'actor' ?  'A' : 'U' };
    var __transaction = Pol.DB.db.transaction("Repository", "readwrite");
    var __store       = __transaction.objectStore("Repository");
    var __request     = __store.put(__data);
    __request.onsuccess = function(e){};
    __request.onerror   = function(e){};
  }

  
  function __footer_text(text){ $('footer').innerHTML = text; }
  function __btn_toolActor  (){ Tools.Current = Tools.Actor; __footer_text(Tools.Current.name); }
  function __btn_toolUseCase(){ Tools.Current = Tools.Use; __footer_text(Tools.Current.name);}
  function __btn_toolPointer(){ Tools.Current = Tools.Pointer; __footer_text(Tools.Current.name);}
  function __btn_toolLink   (){ Tools.Current = Tools.Link; __footer_text(Tools.Current.name);}
  
  function __btn_delete(){
    if(_target && _target.__type === 'actor'){
      _cm.executeCommad(UML.Commands.DeleteActor(_target));
      _target = undefined;
      return;
    }
    if(_target && _target.__type === 'use'){
      _cm.executeCommad(UML.Commands.DeleteUseCase(_target));
      _target = undefined;
    }
  }

  function __show_config_dialog(){
    var __dlg = Pol.Dialogs.show('Configuración', 
                                  '¿Está seguro de cambiar la configuración de este sistema tan complejo, así, por las buenas?',
                                  Pol.Dialogs.centerLayout(300, 230));
    __dlg.btnCancel.onclick = function(){
      Pol.Dialogs.close();
    }
    __dlg.btnOk.onclick = function(){
      Pol.Dialogs.hide( function(){
        var __dlg = Pol.Dialogs.show('Configuración', 
                                     '¡¡¡ Ha cambiado la configuración !!! ',
                                     Pol.Dialogs.centerLayout(350, 100), 1600)
                                     .hideFooter();
      });
    }
  }

  function __show_parseText_dialog(){
    var __find_A     = function(text){ return _document.actors.where( function(a){ return a.text == text; })[0]; }
    var __find_U     = function(text){ return _document.uses.where( function(u){ return u.text == text; })[0];   }
    var __parse_text = function(){
      Pol.Dialogs.hide( function(){
        var __lines        = $('txt-meta').value.split('\n');
        var __dlg_question = Pol.Dialogs.show('Crear diagrama', 
                                              '¿Está seguro de continuar?. <br/>Perderá cualquier cambio que no haya guardado.',
                                              Pol.Dialogs.centerLayout(350, 200));
        __dlg_question.btnCancel.onclick = Pol.Dialogs.close;
        __dlg_question.btnOk.onclick     = function(){                
          __parse_Lines(__lines);
          Pol.Dialogs.close();          
        }
      });
    }

    var __parse_Lines = function(lines){
      __resetDocument(); 
      lines.forEach( function(l){
        var __actors = [];
        l.split(':').forEach( function(e, i){          
          var __key = e.trim();
          if(__key.length == 0) return;          
          // ==============================================================================================
          // actor
          // ==============================================================================================
          if(__key.beginsWith('[')){ 
            __key = __key.replace('[', '').replace(']','');
            var __a = __find_A(__key);
            if(!__a){              
              UML.Commands.AddActor({ x : 60 + 100 * _document.actors.length , y : 100, text : __key })
                          .execute(_document);
              __a = _document.actors[_document.actors.length-1];
            }
            __actors.push(__a);
            return;
          }
          // ==============================================================================================
          // Use case
          // ==============================================================================================
          var __u = __find_U(__key);
          if(!__u){              
            UML.Commands.AddUseCase({ x : 60 + 160 * _document.uses.length, y : 300, text : __key })
                        .execute(_document);
            __u = _document.uses[_document.uses.length-1];
          }
          __actors.forEach( function(a){ UML.Commands.CreateLink(a, __u).execute(_document); });                                             
        });
      }) 
    }

    var __dlg = Pol.Dialogs.show('Crear diagrama', '', Pol.Dialogs.PercentLayout(50, 50));
    __dlg.body.innerHTML    = '<textarea id="txt-meta">[Administrador]:Borrar elemento</textarea>'
    __dlg.btnCancel.onclick = Pol.Dialogs.close;
    __dlg.btnOk.onclick     = function(){
      if(_document.actors.length || _document.uses.length){
        __parse_text();
      }else{
        __parse_Lines( $('txt-meta').value.split('\n') );
        Pol.Dialogs.close(); 
      }                  
    }
  }

  function __saveDocument(){

    if(!_document.name){
       var __dlg = Pol.Dialogs.show('Grabar diagrama', '', Pol.Dialogs.centerLayout(300, 210));
      __dlg.body.innerHTML    = '<label for="txt-doc-name">Nombre del diagrama</label><input type="text" id="txt-doc-name" value="" />'
      __dlg.btnCancel.onclick = Pol.Dialogs.close;
      __dlg.btnOk.onclick = function(){
        _document.name = $('txt-doc-name').value.trim();
         Pol.Dialogs.hide(__saveDocument);
      }
      return;
    }
    
    var __data = { name : _document.name, actors : [], uses : [], links : [] };
    _document.actors.forEach( function(a){__data.actors.push( { text : a.text, x : a.center.x , y : a.center.y }); });
    _document.uses.forEach  ( function(u){__data.uses.push( { text : u.text, x : u.center.x , y : u.center.y }); });
    _document.links.forEach ( function(l){__data.links.push( { from : _document.actors.indexOf(l.from), 
                                                               to   : _document.uses.indexOf(l.to) 
                                                             }); });

    var __transaction = Pol.DB.db.transaction("Files", "readwrite");
    var __store       = __transaction.objectStore("Files");
    var __request     = __store.put(__data);
    __request.onsuccess = function(e) {
      Pol.Dialogs.show('Grabar', 'El diagrama se ha grabado corretamente', Pol.Dialogs.centerLayout(300, 120), 1300)
                 .hideFooter();    
    };
    __request.onerror = function(e){
      var __dlg = Pol.Dialogs.show('Error', 'Error al grabar el diagrama', Pol.Dialogs.centerLayout(300, 120));
      __dlg.btnCancel.onclick = Pol.Dialogs.close;
      __dlg.btnOk.style.display = 'none';
    };      
  }

  function __show_repository_dialog(){
    var __dlg = Pol.Dialogs.show('Repositorio', '', Pol.Dialogs.centerLayout(300, 280));
    __dlg.btnCancel.onclick = Pol.Dialogs.close;
    __dlg.btnOk.onclick = function(){      
      Pol.each(__dlg.body.querySelectorAll('.lv-item.checked'), function(item){           
        //Pol.DB.deleteRow('Repository', item.dataset.key, function(result){
        //  console.log(result);
        //})
        var __fn = item.dataset.entity=='U' ? UML.Commands.AddUseCase : UML.Commands.AddActor;
        _cm.executeCommad(__fn({ x    : Pol.Core.Game.GameWidth/2, 
                                 y    : Pol.Core.Game.GameHeight/2, 
                                 text : item.textContent }));      
      });
      Pol.Dialogs.close();
    };   

    Pol.DB.readAll('Repository', function(values){
      var __sb = [];
      values.forEach( function(v){
        __sb.push('<div class="lv-item" data-entity="{1}" data-key="{2}">{0}</div>'.format(v.text, v.type, v.name));
      });
      __dlg.body.innerHTML = __sb.join('');
      Pol.each(__dlg.body.querySelectorAll('.lv-item'), function(item){
        item.onclick = (function(){
          return function(){
            this.__checked = !this.__checked;
            this.className = this.__checked ? 'lv-item checked' : 'lv-item';
          }
        })();
      });     
    });      
  }

  function __show_open_dialog(){
    var __files;
    var __selected;
    var __dlg = Pol.Dialogs.show('Abrir diagrama', '', Pol.Dialogs.centerLayout(300, 330));
    __dlg.btnCancel.onclick = Pol.Dialogs.close;
    __dlg.btnOk.onclick     = function(){     
      if(__selected){
        var __data = __files[__selected.dataset.index];
        __resetDocument();
        _document.name = __data.name;
        __data.actors.forEach( function(a){ UML.Commands.AddActor(a).execute(_document); });
        __data.uses.forEach  ( function(u){ UML.Commands.AddUseCase(u).execute(_document); }); 
        __data.links.forEach ( function(u){ UML.Commands.CreateLink(_document.actors[u.from],
                                                                    _document.uses[u.to]).execute(_document); }); 
        Pol.Dialogs.close();
      }      
    };  

    Pol.DB.readAll('Files', function(files){
      __files = files;
      var __sb = [];
      __files.forEach( function(f, i){      
        __sb.push('<div class="lv-item" data-index="{1}" data-entity="File">{0}</div>'.format(f.name, i));
      });
      __dlg.body.innerHTML = __sb.join('');
      Pol.each(__dlg.body.querySelectorAll('.lv-item'), function(item){
        item.onclick = function(){
          if(__selected) __selected.className = 'lv-item';           
          __selected = this;          
          __selected.className = 'lv-item checked';          
        };
      });     
    });
  }

  // ==================================================================
  //  Common Draw stuff
  // ==================================================================
  function __draw(ctx){
    Pol.Core.Drawing.Clear('white');   
    
    _document.links.forEach (function(l){ __drawLink(l);  });
    _document.actors.forEach(function(a){ __drawActor(a); });
    _document.uses.forEach  (function(u){ __drawUseCase(u); });

    
    //if(_InputManager.Data.Move){
    // if(_current_actor){
    //    _current_actor.bounds.left = _InputManager.Data.x - 25;
    //    _current_actor.bounds.top  = _InputManager.Data.y - 43;
    //  }   
    //}
  }

  function __drawLink(l){   
    var __ctx = Pol.Core.Game.Context;
    __ctx.beginPath();
    __ctx.lineWidth = 1;   
    __ctx.strokeStyle = 'black';   
    __ctx.moveTo(l.from.center.x, l.from.center.y);
    __ctx.lineTo(l.to.center.x, l.to.center.y);
    __ctx.stroke();
    __ctx.closePath();
  }

  function __drawActor(a){
    var __ctx = Pol.Core.Game.Context;
    __ctx.fillStyle = 'white';   
    __ctx.fillRect(a.center.x - a.w/2 - 10, a.center.y - a.h/2 - 5, a.w + 20, a.h + 10);        
    __ctx.lineWidth = a.selected ? 2 : 1;
    __ctx.strokeStyle = a.selected ? 'navy' : 'black';
    __ctx.beginPath();
    // head
    __ctx.arc(a.center.x, a.center.y - a.h/2.9, 12, 0, 2 * Math.PI, false);
    __ctx.fill();
    // trunk
    __ctx.moveTo(a.center.x, a.center.y - a.h/5);
    __ctx.lineTo(a.center.x, a.center.y + a.h/8);
    // Arms
    __ctx.moveTo(a.center.x - a.w/2, a.center.y - a.h/8);
    __ctx.lineTo(a.center.x + a.w/2, a.center.y - a.h/8);
    // legs
    __ctx.moveTo(a.center.x, a.center.y + a.h/8);
    __ctx.lineTo(a.center.x - a.w/2, a.center.y + a.h/2);
    __ctx.moveTo(a.center.x, a.center.y + a.h/8);
    __ctx.lineTo(a.center.x + a.w/2, a.center.y + a.h/2);
    __ctx.stroke();
    __ctx.closePath();

    __ctx.font = 'italic  12px Verdana';
    __ctx.textAlign = 'center';
    __ctx.textBaseline = 'middle';
    __ctx.fillStyle = a.selected ? 'navy' : 'black';  
    __ctx.fillText(a.text, a.center.x, a.center.y + a.h/2 + 13);
  }

  function __drawUseCase(g){
    var ctx = Pol.Core.Game.Context;
    ctx.font = 'italic 12px Verdana';
    var __lines = wrapText(ctx, g.text, 140 * .8, 12);  
    var __heigth = Math.max(20, (__lines.length) * 12);
    ctx.lineWidth = g.selected ? 2 : 1;
    drawEllipse(Pol.Core.Game.Context, g.center.x, g.center.y, 70, __heigth, '', g.selected ? 'navy' : 'black');        
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';    
    var y = __lines.length==1 ? g.center.y : g.center.y - __heigth/2 + 5 ;
    ctx.fillStyle = g.selected ? 'navy' : 'black'
    __lines.forEach( function(l){
       ctx.fillText(l.text, g.center.x, y + l.y);
    });
  }
  
  function wrapText(ctx, text, maxWidth, lineHeight) {
    var __y = 0;
    var __lines = [];
    var words = text.trim().split(' ');
    var line = '';
    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        __lines.add( { y : __y, text : line });        
        line = words[n] + ' ';
        __y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    __lines.add( { y : __y, text : line }); 
    return __lines;    
  }
   
  function drawEllipse(ctx, x, y, w, h, fillStyle, strokeStyle) {
    ctx.beginPath();    
    for (var i = 0; i < 2 * Math.PI + 0.05 ; i += 0.1 ) {
      var xPos = x  + (w * Math.cos(i));
      var yPos = y  + (h * Math.sin(i));
      if(i == 0) ctx.moveTo(xPos, yPos);
      else       ctx.lineTo(xPos, yPos);      
    }   
    ctx.strokeStyle = strokeStyle || 'black';
    ctx.fillStyle = fillStyle || 'white';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();  
  }
 
  return  _that; 
}();

var CreateActor = function(o){
  var W = 50;
  var H = 86;
  var _this = { bounds   : Pol.Core.Game.Collision.CreateRectangle(o.x - W/2, o.y - H/2, W, H),
                h        : 86,
                w        : 50, 
                center   : { x : o.x, y : o.y },
                refresh  : function (){
                  _this.bounds = Pol.Core.Game.Collision.CreateRectangle(_this.center.x - W/2, _this.center.y - H/2, W, H)
                },
                text     : o.text || 'Actor',
                selected : false,
                __type   : 'actor'
              };
  return _this;
}
  
var CreateUseCase = function(o){
  var W = 100;
  var H = 60;
  var _this = { bounds   : Pol.Core.Game.Collision.CreateRectangle(o.x - W/2, o.y - H/2, W, H), 
                h        : 60,
                w        : 100, 
                center   : { x : o.x, y : o.y },
                refresh  : function (){
                  _this.bounds = Pol.Core.Game.Collision.CreateRectangle(_this.center.x - _this.w/2, _this.center.y - _this.h/2, _this.w, _this.h)
                },
                text     : o.text || 'Caso de uso',
                selected : false,
                __type   : 'use'
              };
  return _this;
}

var CreateAll = function(o){  
  UML.Commands.AddActor({ x : 100, y : 100, text : 'Actor 1' }).execute(o);
  UML.Commands.AddActor({ x : 300, y : 100, text : 'Actor 2' }).execute(o);
  UML.Commands.AddUseCase({ x : 400, y : 300, text : 'Borrar' }).execute(o);
  UML.Commands.CreateLink(o.actors[0], o.uses[0]).execute(o);
  UML.Commands.CreateLink(o.actors[1], o.uses[0]).execute(o);
}

// ================================================================================================================
//
// CommandManager
// 
// ================================================================================================================
Pol.Core.CommandManager = function(doc){
  var _this = { _undos : [],
                _redos : [],
                clear : function(){
                  _this._undos.length = 0;
                  _this._redos.length = 0;
                },
                executeCommad : function(command){
                  try{
                    _this._undos.push(command.execute(doc));
                    _this._redos.length = 0;
                  }catch(e){ console.error(e) }
                },
                undo : function(){
                  if(_this._undos.length > 0) {
                    _this._redos.push(_this._undos.pop().undo(doc));                        
                  }                
                },
                redo : function(){
                  if(_this._redos.length > 0) {    
                    _this._undos.push(_this._redos.pop().execute(doc));
                  }
                }
  };  
  return _this;
};
// ================================================================================================================
//
// UML.Commands.AddActor
// 
// ================================================================================================================
UML.Commands.AddActor = function(o){
  var __actor = CreateActor(o);
  var __command = {
    execute : function(doc){      
      doc.actors.push(__actor);      
      return __command;
    },
    undo : function(doc){
      doc.actors.pop();      
      return __command;
    }
  }
  return __command;
}
// ================================================================================================================
//
// UML.Commands.DeleteActor
// 
// ================================================================================================================
UML.Commands.DeleteActor = function(o){ 
  var __command = {
    links   : [],
    execute : function(doc){ 
      o.selected = false;     
      doc.actors.remove(o);
      __command.links = doc.links.where( function(l){ return l.from == o; });
      doc.links       = doc.links.where( function(l){ return l.from != o; });
      return __command;
    },
    undo : function(doc){
      doc.actors.push(o);
      doc.links = doc.links.concat(__command.links);
      return __command;
    }
  }
  return __command;
}
// ================================================================================================================
//
// UML.Commands.ChangeText
// 
// ================================================================================================================
UML.Commands.ChangeText = function(o, text){  
  var __command = {
    _old_value : o.text,
    _new_value : text,
    execute : function(doc){            
      o.text = __command._new_value;      
      return __command;
    },
    undo : function(doc){
      o.text = __command._old_value;      
      return __command;
    }
  }
  __command._old_value = o.text;
  return __command;
}
// ================================================================================================================
//
// UML.Commands.AddUseCase
// 
// ================================================================================================================
UML.Commands.AddUseCase = function(o){
  var __use = CreateUseCase(o);
  var __command = {
    execute : function(doc){      
      doc.uses.push(__use);      
      return __command;
    },
    undo : function(doc){
      doc.uses.pop();      
      return __command;
    }
  }
  return __command;
}
// ================================================================================================================
//
// UML.Commands.DeleteUseCase
// 
// ================================================================================================================
UML.Commands.DeleteUseCase = function(o){ 
  var __command = {
    links   : [],
    execute : function(doc){    
      o.selected = false;   
      doc.uses.remove(o);
      __command.links = doc.links.where( function(l){ return l.to == o; });
      doc.links       = doc.links.where( function(l){ return l.to != o; });
      return __command;
    },
    undo : function(doc){
      doc.uses.push(o);
      doc.links = doc.links.concat(__command.links);
      return __command;
    }
  }
  return __command;
}
// ================================================================================================================
//
// UML.Commands.CreateLink
// 
// ================================================================================================================
UML.Commands.CreateLink = function(a, b){  
  var __command = {
    execute : function(doc){      
      doc.links.push( { from : a, to : b });      
      return __command;
    },
    undo : function(doc){
      doc.links.pop(); 
      return __command;
    }
  }
  return __command;
}
// ================================================================================================================
//
// UML.Commands.CreateLink
// 
// ================================================================================================================
UML.Commands.MoveEntity = function(t, x, y){  
  var __command = {
    target  : t,
    to      : { x : t.center.x,  y : t.center.y },
    from    : { x : t._center.x, y : t._center.y },
    execute : function(doc){ 
      __command.target.center.x = __command.to.x;
      __command.target.center.y = __command.to.y;
      __command.target.refresh();
      return __command;
    },
    undo : function(doc){
      __command.target.center.x = __command.from.x;
      __command.target.center.y = __command.from.y;      
      __command.target.refresh();      
      return __command;
    }
  }
  return __command;
}