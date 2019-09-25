
(function(Pol){      

  var __measure_text = function(ctx, font, text){
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  function __clear_chart(chart){
    chart.canvas.width  = chart.Width;
    chart.canvas.height = chart.Height;
    chart.ctx.fillStyle = 'white';
    chart.ctx.fillRect(0,0, chart.canvas.width, chart.canvas.height);      
    chart.ctx.fillStyle = chart.fill;
    chart.ctx.fillRect(chart.bounds.left, chart.bounds.top, chart.bounds.width, chart.bounds.height); 
  }
  
  function __draw_axes(chart){
    chart.ctx.lineWidth = 1;
    chart.ctx.strokeStyle = 'black';      
    chart.ctx.beginPath();
    chart.ctx.moveTo(chart.bounds.left, chart.bounds.top - 4);
    chart.ctx.lineTo(chart.bounds.left, chart.bounds.top + chart.bounds.height + 4);
    chart.ctx.moveTo(chart.bounds.left - 4, chart.bounds.top + chart.bounds.height);
    chart.ctx.lineTo(chart.bounds.left + chart.bounds.width + 4, chart.bounds.top + chart.bounds.height); 
    chart.ctx.stroke();
  }
  
  function __drawProfile(chart){  
    
    chart.ctx.save();
    chart.ctx.beginPath();
    chart.ctx.rect(chart.bounds.left, chart.bounds.top - chart.Padding[0]-4, chart.bounds.width, chart.bounds.height + chart.Padding[0]+4);
    chart.ctx.clip()

    var __offsetX = chart.worldToScreenX(chart.data.view.x.min) - chart.bounds.left ;
    chart.ctx.translate(-__offsetX, 0);
    chart.ctx.beginPath();
    chart.ctx.moveTo(chart.bounds.left, chart.bounds.top + chart.bounds.height);
    chart.data.distances.forEach( function(d, i){ chart.ctx.lineTo(chart.worldToScreenX(d), chart.worldToScreenY(chart.data.elevations[i])); } );   
    chart.ctx.lineTo(chart.bounds.left + chart.bounds.width, chart.bounds.height + chart.Padding[0] + 100 );
    chart.ctx.closePath();
    chart.ctx.lineWidth = 1;
    chart.ctx.fillStyle = 'rgba(0,0,125,.8)';  
    chart.ctx.fill();
    chart.ctx.strokeStyle = 'black';
    chart.ctx.stroke();

    if(chart.mouse.drag){      
      var __x0 = chart.worldToScreenX(chart.data.distances[chart.mouse.dragEnd]);
      var __x1 = chart.worldToScreenX(chart.data.distances[chart.mouse.dragStart]);
      chart.ctx.fillStyle = 'rgba(0,200,0,.35)';
      chart.ctx.fillRect(__x0, chart.bounds.top, __x1 - __x0, chart.bounds.height);   
    }

    if(chart.mouse.current > -1){
      var __circle = Pol.Core.Collision.CreateCircle(chart.worldToScreenX(chart.data.distances[chart.mouse.current]),
                                                     chart.worldToScreenY(chart.data.elevations[chart.mouse.current]),
                                                     4);
      Pol.Graphics.DrawCircle(chart.ctx, __circle, 2, 'black', 'yellow');  
    }

    chart.ctx.restore();
  }
  
  Math.log10 = Math.log10 || function (x) { return Math.log(x) / Math.LN10; };


  function __niceScale(min, max, steps){
    var range       = __niceNum(max - min, false);
    var tickSpacing = __niceNum(range / (steps - 1), true)
    var niceMin     = Math.floor(min / tickSpacing) * tickSpacing;
    var niceMax     = Math.ceil (max / tickSpacing) * tickSpacing;

    function __niceNum(range,round) {
      var exponent     = Math.floor(Math.log10(range)); 
      var fraction     = range / Math.pow(10, exponent);
      var niceFraction ;
      if (round) {
        if (fraction < 1.5)
          return Math.pow(10, exponent);
        else if (fraction < 3)
          return 2 * Math.pow(10, exponent);
        else if (fraction < 7)
          return 5 * Math.pow(10, exponent);
        else
          return 10 * Math.pow(10, exponent);
      } 
        if (fraction <= 1)
         return Math.pow(10, exponent);
        else if (fraction <= 2)
         return 2 * Math.pow(10, exponent);
        else if (fraction <= 5)
          return 5 * Math.pow(10, exponent);
        else
          return 10 * Math.pow(10, exponent); 
    }
    return { range : range, min : niceMin, max : niceMax, tickSpacing : tickSpacing };
  }
  
  function __drawScaleY(chart){    
    chart.ctx.lineWidth    = 1;   
    chart.ctx.strokeStyle  = 'silver'; 
    chart.ctx.fillStyle    = 'black';
    chart.ctx.font         = '10px sans-serif-condensed';
    chart.ctx.textAlign    = 'right'; 
    chart.ctx.textBaseline = 'middle';   
   
    chart.ctx.save();
    chart.ctx.beginPath();
    chart.ctx.rect(0, 23, chart.Width, chart.Height);
    chart.ctx.clip();

    var __scale = __niceScale(~~chart.data.view.y.min, ~~chart.data.view.y.max, 8);
    for(var x = __scale.max; x > __scale.min; x -= __scale.tickSpacing){      
      var __y = chart.worldToScreenY(x);
      if(__y < chart.bounds.top) continue;      
      chart.ctx.beginPath();
      chart.ctx.moveTo(chart.bounds.left - 4, __y);
      chart.ctx.lineTo(chart.bounds.left + chart.bounds.width + 2, __y);        
      chart.ctx.stroke();          
      chart.ctx.fillText('{0} m'.format(x), chart.bounds.left - 6, __y);      
    }
    chart.ctx.restore();
  }

  function __drawScaleX(chart){    
    chart.ctx.lineWidth    = 1;                    
    chart.ctx.fillStyle    = 'black';
    chart.ctx.font         = '10px sans-serif-condensed';
    chart.ctx.textAlign    = 'center'; 
    chart.ctx.textBaseline = 'middle';
    chart.ctx.strokeStyle = 'silver'; 
    var __offsetX  = chart.worldToScreenX(chart.data.view.x.min) - chart.bounds.left;
    chart.ctx.translate(-__offsetX, 0);
    var __scale = __niceScale(chart.data.view.x.min, chart.data.view.x.max, Math.floor(chart.bounds.width/50));
    for(var x = __scale.min; x <= __scale.max; x += __scale.tickSpacing){    
      var __x_pos  = chart.worldToScreenX(x);
      if(__x_pos - __offsetX < chart.bounds.left) continue;
      if(__x_pos - __offsetX > chart.bounds.left + chart.bounds.width ) continue;
      chart.ctx.moveTo(__x_pos, chart.bounds.top - 4);
      chart.ctx.lineTo(__x_pos, chart.bounds.top + chart.bounds.height + 4);         
      chart.ctx.stroke();
      chart.ctx.fillText('{0} km'.format((x/1000).toFixed(1)), __x_pos + 6, chart.bounds.top + chart.bounds.height + 12);  
    }
    chart.ctx.translate(__offsetX, 0);
  }

  function __drawLaps(chart){
    
    if(!chart.data.laps.length) return;
    
    chart.ctx.save();
    chart.ctx.beginPath();
    chart.ctx.rect(chart.bounds.left - 2, 0, chart.bounds.width + 10, 32);
    chart.ctx.clip();

    var __x        = 0;
    var __last     = chart.worldToScreenX(0.0);
    var __offsetX  = chart.worldToScreenX(chart.data.view.x.min) - chart.bounds.left;
    chart.ctx.translate(-__offsetX, 0);
    chart.data.laps.forEach( function(lap, i){
      var __x = chart.worldToScreenX(chart.data.distances[lap.id]);      
      lap.circle = Pol.Core.Collision.CreateCircle(__x, chart.bounds.top-13, 2);      
      chart.ctx.fillStyle = 'silver';
      chart.ctx.fillRect(__last + 5, chart.bounds.top-15, __x - __last - 11, 4); 
      if(i==0){
        Pol.Graphics.DrawCircle(chart.ctx, Pol.Core.Collision.CreateCircle(__last, chart.bounds.top-13, 2), 1, 'black', 'white');           
      }
      Pol.Graphics.DrawCircle(chart.ctx, lap.circle, 1, 'black', 'white');           
      __last = __x;
    }); 
    Pol.Graphics.DrawCircle(chart.ctx, Pol.Core.Collision.CreateCircle(chart.worldToScreenX(chart.data.total.distance), chart.bounds.top-13, 2), 1, 'black', 'white');
    chart.ctx.fillStyle = 'silver';
    chart.ctx.fillRect(__last + 5, chart.bounds.top-15, chart.worldToScreenX(chart.data.total.distance)- __last - 11, 4); 

    chart.ctx.restore();
  }

  function __draw(chart){
    if(!chart.data) return;
    __clear_chart(chart);      
    __drawScaleY(chart);
    __drawScaleX(chart);
    __draw_axes(chart);
    __drawLaps(chart)
    __drawProfile(chart);
    return chart;
  }
  
  function __resize(chart, width, height){
    chart.Width  = width;
    chart.Height = height;
    chart.RefreshLayout(chart);
    return chart;
  }

  function __refreshLayout(chart){
    chart.bounds = new Pol.Core.Math.Rect(chart.Padding[3], 
                                          chart.Padding[0], 
                                          chart.Width  - chart.Padding[1] - chart.Padding[3],
                                          chart.Height - chart.Padding[0] - chart.Padding[2]);
    if(chart.data){
      chart.ratio[0] = 100.0 / chart.data.view.x.range; 
      chart.ratio[1] = 100.0 / chart.data.view.y.range;
    }
    return chart.Draw();
  }  
    
  function __create(o){
    var __canvas = $.$('canvas', { id          : o.id || 'profileCanvas',
                                   width       : o.Width, 
                                   height      : o.Height,
                                   onmousemove : __onMouseMove,
                                   onmouseup   : __onMouseUp,
                                   onmousedown : __onMouseDown,
                                   onmouseleave: __onMouseLeave,
                                   onmousewheel: __onmousewheel
    });
    var __chart = {Events  : { OnTap           : new Pol.Core.Event('Pol.ProfileViewer.OnTap'),
                               OnItemSelected  : new Pol.Core.Event('Pol.ProfileViewer.OnItemSelected'),
                               OnMouseMove     : new Pol.Core.Event('Pol.ProfileViewer.OnMouseMove'),
                               OnRange         : new Pol.Core.Event('Pol.ProfileViewer.OnRange')},
                   Width   : __canvas.width, 
                   Height  : __canvas.height, 
                   Padding : o.Padding,                                     
                   fill    : 'rgba(255,255,255,1)',
                   id      : __canvas.id,
                   canvas  : __canvas,
                   ctx     : __canvas.getContext("2d"),
                   data    : {},
                   mouse   : {},
                   ratio   : [],
                   worldToScreenX : function(x){
                     return this.bounds.left + (x * this.ratio[0] * this.bounds.width / 100);
                   },
                   worldToScreenY : function(y){
                     return this.bounds.top + this.bounds.height - ((y - __chart.data.view.y.min)  * this.ratio[1] * this.bounds.height / 100);
                   },
                   screenToWorldX  : function(x){ 
                      return this.data.view.x.min + (x - this.bounds.left) * 100 / (this.bounds.width *  this.ratio[0] ) ;
                   }, 
                   indexPoinAt : function(distance){
                      var __i = -1;
                      __chart.data.distances.forEach( function(d){ if(d > distance) return; __i++; });
                      return __i;
                   },
                   Draw          : function()     { return __draw(__chart); },
                   RefreshLayout : function()     { return __refreshLayout(__chart); },
                   Resize        : function(w, h) { return __resize(__chart, w, h); },
                   DrawPosition  : function(index){ 
                     __chart.mouse.current = index; 
                     return __draw(__chart);
                   }
    };


    function __onMouseLeave(eventArg){
      if(__chart.mouse.mouseDown){
        __chart.mouse.mouseDown = false;
        __chart.mouse.drag = false;
        __chart.Draw();     
      }
    }

    function __onMouseUp(eventArg){
      var __pos   = { x :  eventArg.offsetX, y : eventArg.offsetY };
      var __reset = function(){
        __chart.mouse.mouseDown = false;
        __chart.mouse.drag = false; 
        __chart.Draw();
        eventArg.preventDefault();
      }
      // =======================================================================
      // 1 - Tap
      // =======================================================================
      if(__chart.mouse.mouseDown && __chart.mouse.mouseDownPosition.x == __pos.x 
                                 && __chart.mouse.mouseDownPosition.y == __pos.y){
        console.log('pixel : {0} - distance : {1}'.format(__pos.x, __chart.screenToWorldX(__pos.x)));
        // ================================================================================================
        // 1.1 - Laps
        // ================================================================================================
        var __offsetX  = __chart.worldToScreenX(__chart.data.view.x.min) - __chart.bounds.left;
        var __lap = __chart.data.laps.find( function(lap){ 
          return lap.circle.distance({ x : __offsetX + __pos.x, y : __pos.y}) < 4.0; 
        });
        if(__lap){
          __chart.Events.OnItemSelected.Dispatch( { target : 'lap', lap : __lap });
          return __reset();
        }
        // ===================================================================================
        // 1.2 - Add Waypoint
        // ===================================================================================       
        if(__chart.bounds.contains(__pos)){
          __chart.Events.OnTap.Dispatch(__chart.indexPoinAt(__chart.screenToWorldX(__pos.x)));
          return __reset();
        }        
        //__chart.Events.OnTap.Dispatch(-1);
        return __reset();
      }
      // =======================================================================
      // 2 - Drag
      // =======================================================================
      if(__chart.mouse.drag){
        __chart.Events.OnRange.Dispatch({ start : __chart.mouse.dragStart, 
                                          end   : __chart.mouse.dragEnd });             
      }
      __reset();
    }

    function __onMouseDown(eventArg){      
      __chart.mouse.mouseDown = true;
      __chart.mouse.mouseDownPosition = { x :  eventArg.offsetX, y : eventArg.offsetY };       
      __chart.mouse.dragStart = __chart.mouse.dragEnd = __chart.indexPoinAt(__chart.screenToWorldX(__chart.mouse.mouseDownPosition.x));
      eventArg.preventDefault();
    } 
    
    function __onMouseMove(eventArg){
      var __pos = { x : eventArg.offsetX, y : eventArg.offsetY };
      __chart.mouse.drag = __chart.mouse.mouseDown && __chart.bounds.contains(__pos);
      if(__chart.mouse.drag){
        __chart.mouse.dragEnd = __chart.indexPoinAt(__chart.screenToWorldX(__pos.x));
        __chart.Draw();
      }      
      eventArg.preventDefault();
    }
 
    function __onmousewheel(eventArg){                
      //var wheel = eventArg.wheelDelta / 120;
      //eventArg.preventDefault();
    }

    //_that.__onmousemove = function(e){
    //  var __index = __getIndex(__getD(e.offsetX));      
    //  if(__index != -1){
    //    _chart.Events.OnMouseMove.Dispatch(_that.data.points[__index]);
    //  }
    //}
    
    __chart.ctx.imageSmoothingEnabled = false;

    return __chart;  
 
  }
  
  Pol.ProfileViewer = { create : __create };

}(Pol));

