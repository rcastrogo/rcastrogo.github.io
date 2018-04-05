
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
  DEFINE summary   = { "v_nif" : 0, "v_nom" : 0, "v_ape" : 0 }
  DEFINE orderBy   = rol,ca,nif
  DEFINE mergeMode = optimized
           
  # ==========================================================================
  # Secciones de cabecera del informe
  # ==========================================================================
  CREATE section type:header id:PageHeader1 
  SET template
    <div class="rpt-report-header">
      Informe de usuarios
    </div>
  END
  CREATE section type:header id:PageHeader2 
  SET template
{self.location}{self.location}<div class="rpt-report-header-sub">{self.location}</div>
    <div class="rpt-report-header-sub">{id} {type} {self.BS.dataSet.length} {self.BS.fn.getReportDate}</div>
  END

  # ==========================================================================
  # Grupo 01
  # ==========================================================================
  CREATE group key:rol id:Group01_ROL 
  SET header
    <h2 class="rpt-header">Perfil: {current} </h2>
  END
  SET footer
    <div class="rpt-footer">
      Nif = {self.BS.G1.data.v_nif} Nombre = {self.BS.G1.data.v_nom} Apellidos = {self.BS.G1.data.v_ape}
    </div>
    <div class="rpt-footer">{current} {self.BS.G2.recordCount} usuarios</div>
  END
  # ==========================================================================
  # Grupo 02
  # ==========================================================================          
  CREATE group key:ca id:Group02_CA
  SET headerValueProviderfn
    self.BS.fn.header_provider_fn
  END
  SET footerValueProviderfn
    self.BS.fn.footer_provider_fn
  END
  SET header
    <h3 class="rpt-header">{self.jaja:current}</h3>
  END
  SET footer
    <div class="rpt-footer">
      Nif = {self.BS.G2.data.v_nif} Nombre = {self.BS.G2.data.v_nom} Apellidos = {self.BS.G2.data.v_ape}
    </div>
    <div class="rpt-footer">{self.jaja:current} {self.BS.G2.recordCount} usuarios</div>
  END                
  # ==========================================================================
  # Seccion de detalle 1
  # ==========================================================================      
  CREATE detail id:Detail1
  SET template
    <div style="width:98%; margin:1px; padding:2px;">
      {self.BS.isLastRowInGroup} - {self.BS.data.nif} ({self.BS.data.v_nif}) - {self.BS.data.nombre} ({self.BS.data.v_nom}) {self.BS.data.apellidos} ({self.BS.data.v_ape})
    </div>
  END
  # ==========================================================================
  # Seccion de detalle 2
  # ==========================================================================  
  CREATE detail id:Detail2 valueProviderfn:self.BS.fn.d3_provider_fn
  #SET template
  #  <div style="width:98%; margin:1px; background-color:silver; height:1px;"></div>
  #END
  # ==========================================================================
  # Seccion de detalle 3
  # ==========================================================================  
  #CREATE detail id:Detail3 valueProviderfn:self.BS.fn.d3_provider_fn

  # ==========================================================================
  # Seccion de Total General
  # ==========================================================================          
  CREATE section type:total id:Total1 
  SET template
    <div class="rpt-total">
      Total General {self.BS.recordCount}
      <div class="rpt-footer">
        - Nif = {self.BS.G0.v_nif} Nombre = {self.BS.G0.v_nom} Apellidos = {self.BS.G0.v_ape}
      </div>
    </div>
  END

*/}));}

  module.ReportEngine.rd = module.tabbly.execute(__sourceCode());

  module.apply(module.ReportEngine.rd.context, {
    onInitSummaryObject : function(summary){ return summary;},
    iteratefn : function(ctx){ },
    onStartfn : function(ctx){
      ctx.fn = {
        getReportDate  : function(){ return new Date().toDateString(); },
        d3_provider_fn : function(){
          return (self.BS.isLastRowInGroup) ? '' : '<div style="width:98%; margin:1px; background-color:silver; height:1px;"></div>';
        },
        header_provider_fn : function(g){ return '<h2>' + (g.current || 'Sin comunidad') + '</h2>'; },
        footer_provider_fn : function() { return '<h2>footer_provider_fn</h2>';}
      };
    },
    onRowfn         : function(ctx){ },
    onGroupChangefn : function(ctx){ }
  });

  
})(self[__$__module_name]);