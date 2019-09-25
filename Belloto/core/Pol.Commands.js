
Pol.createNamespace('Belloto.Commands', window);


// ====================================================================
//
// Document
// 
// ====================================================================

Belloto.createDocument = function(){
  return { name        : '',
           description : 'Descripcion',
           points     : [], 
           elevations : [],
           distances  : [],
           total      : { min : Number.POSITIVE_INFINITY,
                          max : Number.NEGATIVE_INFINITY,
                          distance  : 0,
                          elevation : 0},
           laps       : [],
           offset     : 0.0,
           bounds     : new google.maps.LatLngBounds(),
           view       : {},
           googleMap  : {}
         }; 
}


// ================================================
//
// Belloto.Commands.AddLap
// 
// ================================================
Belloto.Commands.AddLap = function(lap, callback){
  var __command = {
    execute : function(doc){      
      doc.laps.push(lap);
      lap.marker.setMap(doc.googleMap);
      callback();
      return __command;
    },
    undo : function(doc){
      doc.laps.remove(lap);  
      lap.marker.setMap(null);
      callback();
      return __command;
    }
  }
  return __command;
}
// ================================================
//
// Belloto.Commands.RemoveLap
// 
// ================================================
Belloto.Commands.RemoveLap = function(lap, callback){
  var __command = {
    execute : function(doc){ 
      doc.laps.remove(lap);
      lap.marker.setMap(null);      
      callback();
      return __command;
    },
    undo : function(doc){
      doc.laps.push(lap);
      lap.marker.setMap(doc.googleMap);
      callback();
      return __command;
    }
  }
  return __command;
}