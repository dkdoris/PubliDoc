module.exports=function(db){
var express = require('express'),
path=require("path");
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//*****************MOSTRAR TIPO DUCUMENTO*****************//
//Realiza una consulta a la base de datos y selecciona todos los documentos personales de la tabla de Documentos 
router.get('/mostrarDocumento', function(solicitud, respuesta, next) {

  var mostrarUsuario=db.query("SELECT *FROM Documento",function(error,respuestaBD){
        /*respuestaBD es la respuesta que el servidor obtiene de la base de datos a traves de la sentencia */
      if(error){
        console.log(error);
      }else{
        /*respuesta para enviar informacion a la aplicacion*/
        respuesta.json(respuestaBD); 
      }
  
  })
});


//*****************Crear Publicación de Encuentro*****************//
//Recibe los datos fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,id_Usuario,tipo_Publicacion,numero_Documento, id_Publicacion,id_Documento
//y junto con el valor del borrado logico para realizar una consulta a la base de datos para guardar la dos datos de la publicacion de encuentro en la base de datos
//Primero se ingresa los datos fecha_Publicacion, fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento
//a la tabla de publicacion luego recorro el arreglo id_Documento para guardar en la tabla Publicacion_Documento cada id_Docuemento seleccionado por el usuario
router.post('/crearPublicacionE', function(solicitud, respuesta, next) {
  var ms = Date.parse(solicitud.body.fecha_Encuentro);
  var razon="";
  var todayTime  = new Date(solicitud.body.fecha_Encuentro);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  var fecha=year + "/" + month + "/" + day; 
  var fechaP = new Date();     
 // var verificarCédula=db.query("SELECT cedula FROM Usuario WHERE id_Usuario=? and cedula!=?",[solicitud.body.id_Usuario,solicitud.body.numero_Documento],function(error,respuestaBD){
    var verificarCédula=db.query("SELECT cedula FROM Usuario WHERE cedula!=?",[solicitud.body.numero_Documento],function(error,respuestaBD){
        /*respuestaBD es la respuesta que el servidor obtiene de la base de datos a traves de la sentencia */
      if(error){
        console.log(error);
      }else{
        if(respuestaBD!=""){
          var crearPublicacionE=db.query('INSERT INTO Publicacion(fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento, latitud, longitud,latitud_Reside,longitud_Reside,revision,razon) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [fechaP,fecha,solicitud.body.ubicacion_Encuentro,solicitud.body.lugar_Reside,solicitud.body.detalles,solicitud.body.foto,0,solicitud.body.id_Usuario,solicitud.body.tipo_Publicacion,solicitud.body.numero_Documento,solicitud.body.latitud, solicitud.body.longitud,solicitud.body.latitud_Reside,solicitud.body.longitud_Reside,0,razon],function(error,res,filas){
            if(error){
                console.log(error);
            }else{
              //devuelve la respuesta json el servidor tabla intermedia
                    for (var i = solicitud.body.id_Documento.length - 1; i >= 0; i--) {
                      if(solicitud.body.id_Documento[i]>=1){
                        //insertId para poder obtener el id que se guardo recien en la publicacion anterior
                        var documentoE=db.query('INSERT INTO Publicacion_Documento(id_Publicacion,id_Documento) VALUES(?,?)', [res.insertId,solicitud.body.id_Documento[i]],function(error,columnas,filas){
                          if(error){
                            console.log(error);
                          }else{
                            //and cedula=numero_Documento
                          } 
                        })
                      }            
                    };                
                    /*var seleccionarToken=db.query('SELECT token from Usuario WHERE cedula=? and id_Usuario!=?', [solicitud.body.numero_Documento, solicitud.body.id_Usuario],function(error,resBD,filas){
                              if(error){
                                console.log(error);
                              }else{
                                if(resBD!=""){
                                  var mensaje="El número de cédula "+solicitud.body.numero_Documento+ " se encuentra en un anuncio";
                                  var t=resBD[0]['token']+"";
                                  sendNotificationToUser(t,mensaje);
                                }
                              } 
                            })*/
                respuesta.json("1");
             }

            })
        }else{
          respuesta.json("0"); 
        }        
      }
  
  })  
});
/*********************Crear Publicacion de Perdida*****************/
//Recibe los datos fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento, id_Publicacion,id_Documento
//y junto con el valor del borrado logico para realizar una consulta a la base de datos para guardar la dos datos de la publicacion de perdida en la base de datos
//Primero se ingresa los datos fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento
//a la tabla de publicacion luego recorro el arreglo id_Documento para guardar en la tabla Publicacion_Documento cada id_Docuemento seleccionado por el usuario
router.post('/crearPublicacionP', function(solicitud, respuesta, next) {
  var razon="";
    var ms = Date.parse(solicitud.body.fecha_Perdida);
    var todayTime  = new Date(solicitud.body.fecha_Perdida);
    var month = todayTime.getMonth() + 1;
    var day = todayTime.getDate();
    var year = todayTime.getFullYear();
    var fecha=year + "/" + month + "/" + day; 
    var fechaP = new Date();    
  var crearPublicacionP=db.query('INSERT INTO Publicacion(fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento,latitud, longitud,revision,razon) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', [fechaP,fecha,solicitud.body.ubicacion_Perdida,solicitud.body.detalles,0,solicitud.body.id_Usuario,solicitud.body.tipo_Publicacion,solicitud.body.numero_Documento,solicitud.body.latitud, solicitud.body.longitud,0,razon],function(error,res,filas){
    if(error){
      console.log(error);
   }else{
    //devuelve la respuesta json el servidor tabla intermedia
          for (var i = solicitud.body.id_Documento.length - 1; i >= 0; i--) {
            if(solicitud.body.id_Documento[i]>=1){
              var documentoE=db.query('INSERT INTO Publicacion_Documento(id_Publicacion,id_Documento) VALUES(?,?)', [res.insertId,solicitud.body.id_Documento[i]],function(error,columnas,filas){
                if(error){
                  console.log(error);
                }else{
                } 
              })
            }            
          }; 
                  /*var seleccionarToken=db.query('SELECT token from Usuario WHERE cedula=? and id_Usuario!=?', [solicitud.body.numero_Documento,solicitud.body.id_Usuario],function(error,resBD,filas){
                    if(error){
                      console.log(error);
                    }else{
                      if(resBD!=""){
                        var mensaje="El número de cédula "+solicitud.body.numero_Documento+ " se encuentra en un anuncio";
                                  //"El numero 1105679664 esta en un anuncio
                                  //En un anuncio está el # de cedula
                        var t=resBD[0]['token']+"";
                        sendNotificationToUser(t,mensaje);
                      }
                    } 
                  })*/
          respuesta.json("se creo correctamente la PUBLICACION Encuentro");   
    }
  })

});
/**********************LISTA DE MIS PUBLICAICONES**************************/
//Primero con el id_Usuario se selecciona las publicaciones que esten involucrados con ese id y con 
//borrado_Logico se verifica si esta en cero para saber si el usuario la dio de baja y asi no presentar dicha publicacion
//Se envia el resultado de la consulta a la aplicacion los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento para mostrar la lista de publicaciones
router.post('/listaPublicacion', function(solicitud, respuesta, next) { 
  var mostrarLista=db.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento,id_Usuario,revision from Publicacion where Publicacion.id_Usuario=? and Publicacion.borrado_Logico=?",[solicitud.body.idIdentificacion,0],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      respuesta.json(resBD);   //terminar la peticion 
  } 
  })
});
//*****************Modificar Publicación Encuentro**************//
//Primero selecciona la publicación de Ecuentro a ser modificada con el id_Publicacion que se envio desde la aplicación
//Se actuualiza los datos fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento de la publicacion de encuentro seleccionada
//Después se elimina de la tabla Publicacion_Documento los registros que involucran el id_Publicacion de la publicacion seleccionada
//Posteriormente se inserta el id_Publicacion,id_Documento[i] en la tabla Publicacion_Documento para terminar la modificacion de la publicacion de encuentro
router.put('/modificarPublicacionE', function(solicitud, respuesta, next) {
  var razon="";
  var ms = Date.parse(solicitud.body.fecha_Encuentro);
  var todayTime  = new Date(solicitud.body.fecha_Encuentro);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  var fecha=year + "/" + month + "/" + day; 

      var modificarPublicacionE=db.query('UPDATE Publicacion SET fecha_Encuentro=?, ubicacion_Encuentro=?,lugar_Reside=?,detalles=?,foto=?,numero_Documento=? , latitud=?, longitud=?, latitud_Reside=?, longitud_Reside=?, revision=?,razon=? WHERE id_Publicacion=?', [fecha,solicitud.body.ubicacion_Encuentro,solicitud.body.lugar_Reside,solicitud.body.detalles,solicitud.body.foto,solicitud.body.numero_Documento,solicitud.body.latitud, solicitud.body.longitud,solicitud.body.latitud_Reside,solicitud.body.longitud_Reside,0,razon,solicitud.body.id_Publicacion],function(error,resBD,filas){
        if(error){
          console.log(error);
        }else{
          var modificarPublicacionDoc=db.query('DELETE FROM Publicacion_Documento WHERE id_Publicacion=?',[solicitud.body.id_Publicacion],function(error,res,filas){
            if(error){
              console.log(error);
            }else{
              //RECORRE EL EL ARREGLO ENVIADO DESDE LA APLICACION PARA guardar en la BD
              for (var i = solicitud.body.id_Documento.length - 1; i >= 0; i--) {
                if(solicitud.body.id_Documento[i]>=1){
                  //insertId para poder obtener el ide que se guardo recuien en la publicacion anterior
                  var documentoE=db.query('INSERT INTO Publicacion_Documento(id_Publicacion,id_Documento) VALUES(?,?)', [solicitud.body.id_Publicacion,solicitud.body.id_Documento[i]],function(error,columnas,filas){
                    if(error){
                      console.log(error);
                    }else{                      
                    } 
                  })

                } 
                           
              };
            } 
          })
          respuesta.json("Se modifico correctamente la publicacion");
        } 
      })
});
//*****************Modificar Publicación Perdida**************//
//Primero selecciona la publicación de Eperdida a ser modificada con el id_Publicacion que se envio desde la aplicación
//Se actuualiza los datos fecha_Perdida,ubicacion_Perdida,detalles,numero_Documento de la publicacion de perdida seleccionada
//Después se elimina de la tabla Publicacion_Documento los registros que involucran el id_Publicacion de la publicacion seleccionada
//Posteriormente se inserta el id_Publicacion,id_Documento[i] en la tabla Publicacion_Documento para terminar la modificacion de la publicacion de perdida
router.put('/modificarPublicacionP', function(solicitud, respuesta, next) {
  var razon="";
  var ms = Date.parse(solicitud.body.fecha_Perdida);
  var todayTime  = new Date(solicitud.body.fecha_Perdida);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  var fecha=year + "/" + month + "/" + day; 
  var modificarPublicacionE=db.query('UPDATE Publicacion SET fecha_Perdida=?,ubicacion_Perdida=?,detalles=?,numero_Documento=?, latitud=?, longitud=?, revision=?,razon=? WHERE id_Publicacion=?', [fecha,solicitud.body.ubicacion_Perdida,solicitud.body.detalles,solicitud.body.numero_Documento,solicitud.body.latitud,solicitud.body.longitud,0,razon,solicitud.body.id_Publicacion],function(error,resBD,filas){
    if(error){
      console.log(error);
  }else{
      var modificarPublicacionDoc=db.query('DELETE FROM Publicacion_Documento WHERE id_Publicacion=?',[solicitud.body.id_Publicacion],function(error,res,filas){
        if(error){
          console.log(error);
      }else{
        //RECORRE EL EL ARREGLO ENVIADO DESDE LA APLICACION PARA guardar en la BD
        for (var i = solicitud.body.id_Documento.length - 1; i >= 0; i--) {
          if(solicitud.body.id_Documento[i]>=1){
            //insertId para poder obtener el ide que se guardo recuien en la publicacion anterior
            var documentoE=db.query('INSERT INTO Publicacion_Documento(id_Publicacion,id_Documento) VALUES(?,?)', [solicitud.body.id_Publicacion,solicitud.body.id_Documento[i]],function(error,columnas,filas){
              if(error){
                console.log(error);
              }else{
              } 
            })
          }            
        };
      } 
    })
      respuesta.json("===============SE MODIFICO CORRECTAMENTE LA PUBLICACION DE ENCUENTRO===========================");
  } 
})
});

//*****************Mostrar Publicación Encuentro**************//
//Selecciona los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento,id_Usuario de la tabla Publicación
//además id_Documento de la tabla Publicacion_Documento y nombre_Documento de ta tabla Documento de la publicacion de Encuentro seleccionada
//Tomando en cuenta que que en la tabla Publicacion el id_Publicacion y id_Usuario pertenescan a los datos enviados desde la aplicación 
//Y que el borrado logico de la publicación tenga el valor de cero para poder presentarla 
//De la tabla de Publicacion_Documento se ve si el id_Publicacion sea igual al id de publicacion ingersado y el id_Documento de esta tabla sea igual al id_Documento de la tabla Documento
router.post('/mostrarPublicacionE', function(solicitud, respuesta, next) { 
  var mostrarPublicacionE=db.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion, latitud, longitud,latitud_Reside,longitud_Reside,razon, fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento,id_Usuario,Publicacion_Documento.id_Documento,nombre_Documento,revision from Publicacion,Publicacion_Documento,Documento where Publicacion.id_Publicacion=? and Publicacion.id_Usuario=? and Publicacion.borrado_Logico=? and Publicacion_Documento.id_Publicacion=Publicacion.id_Publicacion and Publicacion_Documento.id_Documento=Documento.id_Documento",[solicitud.body.idIdentificacionP,solicitud.body.idIdentificacion,0],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      //Transforma en string el resultado de la foto enviado de la consulta pues esta guardada en codigo 64
      var f=resBD[0].foto;      
      resBD[0].foto=f.toString();
      respuesta.json(resBD);   //terminar la peticion 
    }   
  })
});
//*****************Mostrar Publicación Perdida**************//
//Selecciona los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,numero_Documento,id_Usuario de la tabla Publicación
//además id_Documento de la tabla Publicacion_Documento y nombre_Documento de ta tabla Documento de la publicacion de perdida seleccionada
//Tomando en cuenta que que en la tabla Publicacion el id_Publicacion y id_Usuario pertenescan a los datos enviados desde la aplicación 
//Y que el borrado logico de la publicación tenga el valor de cero para poder presentarla 
//De la tabla de Publicacion_Documento se ve si el id_Publicacion sea igual al id de publicacion ingersado y el id_Documento de esta tabla sea igual al id_Documento de la tabla Documento
router.post('/mostrarPublicacionP', function(solicitud, respuesta, next) { 
  var mostrarUsuario=db.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,latitud,longitud,fecha_Perdida,razon,ubicacion_Perdida,detalles,numero_Documento,id_Usuario,Publicacion_Documento.id_Documento,nombre_Documento,revision from Publicacion,Publicacion_Documento,Documento where Publicacion.id_Publicacion=? and Publicacion.id_Usuario=? and Publicacion.borrado_Logico=? and Publicacion_Documento.id_Publicacion=Publicacion.id_Publicacion and Publicacion_Documento.id_Documento=Documento.id_Documento",[solicitud.body.idIdentificacionP,solicitud.body.idIdentificacion,0],function(error,resBD,filas){
    if(error){
        console.log(error);
    }else{      
        respuesta.json(resBD);   //terminar la peticion 
    }  
 
  })
});
//*****************Dar de Baja Publicacion**************//
//Actualiza el campo borrado_Logico de estado y le asigna 1 para saber mas adelante que dicha publicacion se dio de baja
router.put('/darDeBajaPublicacion', function(solicitud, respuesta, next) {
  var modificarUsuario=db.query('UPDATE Publicacion SET borrado_Logico=? WHERE id_Publicacion=?', [1,solicitud.body.idIdentificacionP],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      respuesta.json(resBD);
    }
  })
});
//*****************Buscar Publicaciones**************//
//Busca las publicaciones que le pertenecen al usuario dueño ed la cuenta y que involucran el numero de cedula 
// Tomado en cuenta que el borrado lógico esta en cero esto indica que las publicaciones no este dadas de baja
router.post('/buscarPublicacion', function(solicitud, respuesta, next) { 
  var buscarPubli=db.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento from Publicacion where id_Usuario=? and borrado_Logico=? and numero_Documento=?",[solicitud.body.idIdentificacion,0,solicitud.body.cedulatenporal],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      
      respuesta.json(resBD);   //terminar la peticion 
  } 
  })
});
//******************Denuncias******************//
router.post('/denunciarP', function(solicitud, respuesta, next) { 
  var buscarPubli=db.query("INSERT INTO Denuncia(id_UsuarioA,id_UsuarioD,tipo,id_PublicacionD,descripcion,borrado_Logico) VALUES(?,?,?,?,?,?)", [solicitud.body.id_UsuarioA,solicitud.body.id_UsuarioD,1,solicitud.body.id_PublicacionD,solicitud.body.descripcion,0],function(error,resBD,filas){    
    if(error){
      console.log(error);
    }else{      
      respuesta.json(resBD);   //terminar la peticion 
    } 
  })
});
return router;
}



