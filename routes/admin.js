module.exports=function(db){
var express = require('express');
var router = express.Router();

  /* GET admin listing. */
    router.post('/iniciarSesion', function(solicitud, respuesta, next) {
      console.log(solicitud.body);  
      var iniciarsession=db.query("SELECT *FROM Usuario WHERE cedula=? and contrasena=? and rol='admin'",[solicitud.body.usuario,solicitud.body.contrasena],function(error,usuario){
        if(error){         
           respuesta.json("1");  
        }else{
          console.log(usuario);      
          if(usuario.length>0){              
              solicitud.session.nombre=usuario[0].nombres;
              solicitud.session._id=usuario[0].id_Usuario;       
              respuesta.json(usuario);
          }else{
            respuesta.json("");
        }
      }
    });      
  });

    router.get('/listaUsuarios', function(solicitud, respuesta, next) {  
      var consulta=db.query("SELECT *FROM Usuario WHERE rol!='admin'",function(error,usuarios){
                  if(error){
                    console.log(error);                  
                    respuesta.json(1);  
                  }else{                      
                    respuesta.json(usuarios);
                   }
              })       
      });

      router.get('/listaUsuariosDenunciados', function(solicitud, respuesta, next) {  
      var consulta=db.query("SELECT *FROM Denuncia WHERE borrado_Logico=0 and tipo=0",function(error,usuariosDenuncias){
                  if(error){
                    console.log(error);                  
                    respuesta.json(1);  
                  }else{                      
                    respuesta.json(usuariosDenuncias);
                   }
              })       
      });

      router.get('/listaPublicacionesDenunciadas', function(solicitud, respuesta, next) {  
      var consulta=db.query("SELECT *FROM Denuncia WHERE borrado_Logico=0 and tipo=1",function(error,publicacionesDenuncias){
                  if(error){
                    console.log(error);                  
                    respuesta.json(1);  
                  }else{                      
                    respuesta.json(publicacionesDenuncias);
                   }
              })       
      });
  
router.put('/restaurar_contrasena', function(solicitud, respuesta, next) {
  var id=parseInt(solicitud.body.id.toString());  
  var consulta=db.query("SELECT *FROM Usuario WHERE id_Usuario=? and rol!='admin'",[id],function(error,usuario){
     if(error){
       console.log(error);                  
     }else{
        if(usuario.length>0){          
          var consulta1=db.query('UPDATE Usuario SET contrasena=? WHERE id_Usuario=?',[usuario[0].cedula,id],function(error,resBD){
            if(error){
                console.log(error); 
            }else{
              respuesta.json("Se ha restaurado la contraseña correctamente");                
            }
          })
        }else{

        }

     }
  })
  /*
  if(solicitud.session.nombre){

  }else{
    respuesta.redirect('/');
  }
  */
});

router.put('/estado_usuario', function(solicitud, respuesta, next) {  
  var id=parseInt(solicitud.body.id.toString());  
   var consulta=db.query("SELECT *FROM Usuario WHERE id_Usuario=? and rol!='admin'",[id],function(error,usuario){
     if(error){
       console.log(error);                  
     }else{
        if(usuario.length>0){          
          var estado=usuario[0].borrado_Logico;
          if(estado==0){
              estado=1;
          }else{
            estado=0;
          }
          var consulta1=db.query('UPDATE Usuario SET borrado_Logico=? WHERE id_Usuario=?',[estado,id],function(error,resBD){
            if(error){
                console.log(error); 
            }else{          
              respuesta.json("Se ha Modificado el estado correctamente");                
            }
          });
        }else{
          respuesta.json("Error al encontrar usuario");
        }        
     }
  });
});
 
router.delete('/eliminar_usuario', function(solicitud, respuesta, next) {
  var id=parseInt(solicitud.body.id.toString());  
   var consulta=db.query("DELETE FROM Usuario WHERE id_Usuario=?",[id],function(error,resBD){
     if(error){
       console.log(error);                  
     }else{
         var darDeBajaP=db.query('DELETE FROM Publicacion WHERE id_Usuario=?',[id],function(error,res){
          if(error){
            console.log(error); 
          }else{
           respuesta.send("Eliminado Correctamente");                                                
          }
        });      
     }
  });
});

router.post('/mostrar_perfil', function(solicitud, respuesta, next) {
  //console.log(solicitud.body.id);
  var mostrarPerfil=db.query('SELECT *FROM Usuario WHERE id_Usuario=?',[solicitud.param('id')],function(error,res){
    if(error){
      console.log(error); 
    }else{   
      var f=res[0].foto;      
      //var f2=;
      var f2="data:image/jpeg;base64,"+f.toString();
      res[0].foto=f2;  
      //$scope.imgURI = "data:image/jpeg;base64," + imageData;
      //console.log("respuesta "+res[0]['nombres']);
      respuesta.render('perfil',{cuenta:res});
    }
  })
});

router.get('/cerrar_session', function(req, res, next) {
  delete  req.session.nombre;
  delete  req.session.id;
  res.redirect(200,'../');
});

return router;
}