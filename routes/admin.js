module.exports=function(db){
var express = require('express');
var router = express.Router();

  /* GET admin listing. */
    router.post('/', function(solicitud, respuesta, next) {  
      var iniciarsession=db.query("SELECT *FROM Usuario WHERE cedula=? and contrasena=? and rol='admin'",[solicitud.body.usuario,solicitud.body.contrasena],function(error,consulta){
      if(error){
        console.log(error);
       respuesta.render('index', { title: 'Administrador PubliDoc', msj:'Error en la consulta' });	
    }else{
      //devuelve la respuesta json el servidor
      console.log(consulta.length);
      if(consulta.length>0){
             var iniciarsession=db.query("SELECT *FROM Usuario WHERE rol!='admin'",function(error,usuarios){
                  if(error){
                    console.log(error);                  
                  }else{
                    if(usuarios.length>0){                      
                      respuesta.render('admin_principal',{nombre_usuario:"Administrador",list_usuarios:usuarios});
                    }else{
                      respuesta.render('admin_principal',{nombre_usuario:"Administrador",list_usuarios:usuarios});
                    }                                      
                  }

              })
      }else{
       respuesta.render('index', { title: 'Administrador PubliDoc', msj:'Usuario o contraseña incorrectos' });	
      }             
    } 
   })      
    });


router.put('/restaurar_contrasena', function(solicitud, respuesta, next) {
  var consulta=db.query("SELECT *FROM Usuario WHERE id_Usuario=? and rol!='admin'",[solicitud.body.id],function(error,usuario){
     if(error){
       console.log(error);                  
     }else{
        if(usuario.length>0){          
          var consulta1=db.query('UPDATE Usuario SET contrasena=? WHERE id_Usuario=?',[usuario[0].cedula,solicitud.body.id],function(error,resBD){
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
	 var consulta=db.query("SELECT *FROM Usuario WHERE id_Usuario=? and rol!='admin'",[solicitud.body.id],function(error,usuario){
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
          var consulta1=db.query('UPDATE Usuario SET borrado_Logico=? WHERE id_Usuario=?',[estado,solicitud.body.id],function(error,resBD){
            if(error){
                console.log(error); 
            }else{
              respuesta.json("Se ha Modificado el estado correctamente");                
            }
          })
        }

     }
  })
});
 
router.delete('/eliminar_usuario', function(solicitud, respuesta, next) {
	 var consulta=db.query("DELETE FROM Usuario WHERE id_Usuario=?",[solicitud.body.id],function(error,resBD){
     if(error){
       console.log(error);                  
     }else{
        console.log("Usuario eliminado correctamente");
     }
  })
});

return router;
}