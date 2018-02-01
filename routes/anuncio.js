
module.exports=function(db){
var express = require('express'),
path=require("path");
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
/*******************************LISTA DE ANUNCIOS*************************************/
//Primero con el id_Usuario se selecciona los anuncios que no tengan que ver con el id enviado por la aplicación 
//borrado_Logico se verifica si esta en cero para saber si algun usuario le dio de baja y asi no presentar dicha anuncio
//Se envia el resultado de la consulta a la aplicacion los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento para mostrar la lista de publicaciones

router.post('/listaAnuncios', function(solicitud, respuesta, next) { 
  var mostrarLista=db.query("SELECT id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento,id_Usuario,revision from Publicacion where borrado_Logico=? and numero_Documento=? and revision=1",[0,solicitud.body.cedulatenporal],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      //console.log(resBD[0]['revision']);
      respuesta.json(resBD);   //terminar la peticion 
  } 
  })
});

//*****************Mostrar Anuncio de Encuentro**************//
//Selecciona los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento,id_Usuario de la tabla Publicación
//además id_Documento de la tabla Publicacion_Documento y nombre_Documento de ta tabla Documento de la publicacion de encuentro seleccionada
//Tomando en cuenta que que en la tabla Publicacion el id_Publicacion igual y id_Usuario diferente a los datos enviados desde la aplicación 
//Y que el borrado logico de la publicación tenga el valor de cero para poder presentarla 
//De la tabla de Publicacion_Documento se ve si el id_Publicacion sea igual al id de publicacion ingersado y el id_Documento de esta tabla sea igual al id_Documento de la tabla Documento
router.post('/mostrarAnuncioE', function(solicitud, respuesta, next) {  
  var mostrarAnuncioE=db.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento,id_Usuario,Publicacion_Documento.id_Documento,nombre_Documento,latitud, longitud,latitud_Reside,longitud_Reside from Publicacion,Publicacion_Documento,Documento where Publicacion.id_Publicacion=? and Publicacion.id_Usuario!=?  and Publicacion.borrado_Logico=? and Publicacion_Documento.id_Publicacion=Publicacion.id_Publicacion and Publicacion_Documento.id_Documento=Documento.id_Documento",[solicitud.body.idIdentificacionP,solicitud.body.idIdentificacion,0],function(error,resBD,filas){
    if(error){
      console.log(error);
  }else{      
      var f=resBD[0].foto;      
      resBD[0].foto=f.toString();
      respuesta.json(resBD);   //terminar la peticion 
  }  
 
})});
//*****************Mostrar Anuncio de  Perdida**************//
//Selecciona los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento,id_Usuario de la tabla Publicación
//además id_Documento de la tabla Publicacion_Documento y nombre_Documento de ta tabla Documento de la publicacion de perdida seleccionada
//Tomando en cuenta que que en la tabla Publicacion el id_Publicacion igual y id_Usuario diferente a los datos enviados desde la aplicación 
//Y que el borrado logico de la publicación tenga el valor de cero para poder presentarla 
//De la tabla de Publicacion_Documento se ve si el id_Publicacion sea igual al id de publicacion ingersado y el id_Documento de esta tabla sea igual al id_Documento de la tabla Documento
router.post('/mostrarAnuncioP', function(solicitud, respuesta, next) { 
  var mostrarAnuncioP=db.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,latitud,longitud, fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,numero_Documento,id_Usuario,Publicacion_Documento.id_Documento,nombre_Documento from Publicacion,Publicacion_Documento,Documento where Publicacion.id_Publicacion=? and Publicacion.id_Usuario!=? and Publicacion.borrado_Logico=? and Publicacion_Documento.id_Publicacion=Publicacion.id_Publicacion and Publicacion_Documento.id_Documento=Documento.id_Documento",[solicitud.body.idIdentificacionP,solicitud.body.idIdentificacion,0],function(error,resBD,filas){
    if(error){
      console.log(error);
  }else{      
      respuesta.json(resBD);   //terminar la peticion 
  }  
 
})});
//***************************Ver si existe calficicación****************************************//
//Recibe el id_Publicación para poder seleccionar toda la informacion del usuario y publicación  perteneciente a dicha publicación
//Usa el id_Usuario de la consulta anterior para seleccionar la calificacion que tiene tal anuncio todo esto es para saber si el anuncio tiene alguna calificacion mayor a uno 
router.post('/verificarCalificacion',function(solicitud,respuesta){
//Para obtener el id del usuario que Publica
  var verUsuario=db.query("SELECT *from Usuario, Publicacion WHERE Publicacion.id_Publicacion=? and Publicacion.id_Usuario=Usuario.id_Usuario",[solicitud.body.id_Publicacion],function(error,resBD,filas){
    if(error){
      console.log(error); 
    }else{ 
      var verificarUsuario=db.query("SELECT *FROM Calificacion WHERE id_Publicacion=? and id_UsuarioP=? and id_UsuarioC=? and borrado_Logico=0",[solicitud.body.id_Publicacion,resBD[0]['id_Usuario'],solicitud.body.id_UsuarioC],function(error,res,filas){
        if(error){
          console.log(error);
        }else{ 
          respuesta.json(res); 
        }
      }) 
    }   
  })
});
//*********************************Modificar Calificación*************************************//
//Actualiza a informacion de la calificacion 
router.put('/modificarCalificar', function(solicitud, respuesta, next) {
  console.log(solicitud.body);
  var modificarUsuario=db.query('UPDATE Calificacion SET calif=?,comentario=? WHERE id_Publicacion=? and id_UsuarioP=? and id_UsuarioC=?', [solicitud.body.valorC,solicitud.body.comentario,solicitud.body.id_Publicacion,solicitud.body.id_UsuarioP,solicitud.body.id_UsuarioC],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      respuesta.json(resBD);
      }
    })  
  });
//********************************Promedio total de calificacion de usuario******************************************//
//Con avg se saca el promedio de todas las calificaciones que tiene un usuario
  router.post('/promedioCalificar', function(solicitud, respuesta, next) {
   // console.log(solicitud.body.id_UsuarioP);
    var promedioCalificacion=db.query('SELECT avg(calif) from Calificacion WHERE id_UsuarioP=? and calif>? and borrado_Logico=0',[solicitud.body.id_UsuarioP,0],function(error,res,filas){
      if(error){
        console.log(error);
      }else{
        respuesta.json(res);
      }
    })
  });
  router.post('/listaComentarios', function(solicitud, respuesta, next) {
    var listarComentarios=db.query('SELECT nombres,Usuario.foto,calif,comentario,Usuario.id_Usuario FROM Usuario, Calificacion, Publicacion where Calificacion.borrado_Logico=0 and Calificacion.id_Publicacion=? and Calificacion.id_UsuarioC=Usuario.id_Usuario and calif>0 and Calificacion.id_Publicacion=Publicacion.id_Publicacion and Publicacion.id_Usuario!=Calificacion.id_UsuarioC',[solicitud.body.id_Publicacion],function(error,res,filas){
      if(error){
        console.log(error);
      }else{
        var f;
        for (var i = 0; i < res.length; i++) {
          f=res[i].foto;      
          res[i].foto=f.toString();
          //console.log(res[i].foto);
        };
        respuesta.json(res);
      }
    })
  });


return router;
}



