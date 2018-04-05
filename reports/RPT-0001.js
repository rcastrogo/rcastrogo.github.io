
'use strict'; 

(function(module){
 
  function __sourceCode(){        
    return (function(func) {
              var matches = func.toString().match(/function\s*\(\)\s*\{\s*\/\*\!?\s*([\s\S]+?)\s*\*\/\s*\}/);
              if (!matches) return false;
              return matches[1];}(function(){/*

  # ==========================================================================
  # Definición de variables
  # ==========================================================================
  DEFINE summary   = { }
  DEFINE orderBy   = tipo,id
             
  # ==========================================================================
  # Secciones de cabecera del informe
  # ==========================================================================
  CREATE section type:header id:PageHeader1 
  SET template
    <div class="rpt-report-header">
      Informe 0001
    </div>
  END
       
  CREATE section type:header id:PageHeader2 
  SET template
    <div>
      desde: {self.location}
    </div>
  END

  # ==========================================================================
  # Grupo 01
  # ==========================================================================
  CREATE group key:tipo id:Group01_tipo
  SET header
    <h2 class="rpt-header">Tipo: {current}</h2>
  END
  SET footer
    <div>
      <div class="rpt-footer">
        {self.BS.G1.previous.id}
      </div>
      <div class="rpt-footer">{current} {self.BS.G1.recordCount} elementos</div>    
    </div>
  END
  
  # ==========================================================================
  # Seccion de detalle 1
  # ==========================================================================      
  CREATE detail id:Detail1
  SET template
    <div class="rpt-detail">
     {self.BS.data.id}
    </div>
  END
  
  # ==========================================================================
  # Seccion de Total General
  # ==========================================================================          
  CREATE section type:total id:Total1 
  SET template
    <div class="rpt-total">
      Total elementos listados {self.BS.recordCount}
    </div>
  END

*/}));}

  module.ReportEngine.rd = module.tabbly.execute(__sourceCode());

  module.apply(module.ReportEngine.rd.context, {
    onInitSummaryObject : function(summary){ return summary;},
    iteratefn : function(ctx){ },
    onStartfn : function(ctx){
      ctx.fn = {
      };
    },
    onRowfn         : function(ctx){ },
    onGroupChangefn : function(ctx){ }
  });

  
})(self[__$__module_name]);