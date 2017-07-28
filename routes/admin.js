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
      console.log(consulta);                        
      if(consulta.length>0){
      solicitud.session.nombre=consulta[0].nombres;
      solicitud.session._id=consulta[0].id_Usuario; 
             var iniciarsession=db.query("SELECT *FROM Usuario WHERE rol!='admin'",function(error,usuarios){
                  if(error){
                    console.log(error);                  
                  }else{                    
                    var consultardenuncias=db.query("SELECT *FROM denuncia WHERE borrado_Logico=0",function(error,denuncias){
                      if(error){

                      }else{                        
                            var usuarios_denunciados= new Array();
                            var publicaciones_denunciadas=new Array();
                            denuncias.forEach(function(element) {
                              console.log(element);
                          if(element['tipo']==0){
                            usuarios_denunciados.push(element);  
                          }else{
                            publicaciones_denunciadas.push(element); 
                          }
                        }, this);
                        respuesta.render('admin',{tituloPag:"Gestión de Usuarios",nombre_usuario:solicitud.session.nombre,list_usuarios:usuarios, list_denuncia_u:usuarios_denunciados,list_denuncia_p:publicaciones_denunciadas});                                                                             
                      }                                            
                    });                                        
                  }

              })
      }else{
       respuesta.render('index', { title: 'Administrador PubliDoc', msj:'Usuario o contraseña incorrectos' });  
      }             
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