module.exports=function(db){
var express = require('express');
var router = express.Router();

router.post('/iniciarSesion', function(solicitud, respuesta, next) {
   //   console.log(solicitud.body);  
      var iniciarsession=db.query("SELECT *FROM Usuario WHERE cedula=? and contrasena=? and rol='admin'",[solicitud.body.usuario,solicitud.body.contrasena],function(error,usuario){
        if(error){         
           respuesta.json("1");  
        }else{
        //  console.log(usuario);      
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
router.get('/listarPublicaciones', function(solicitud, respuesta, next) {  
      var consulta=db.query("SELECT *FROM Publicacion WHERE revision=0",function(error,publicaciones){
                  if(error){
                    console.log(error);                  
                    respuesta.json(1);  
                  }else{                    
                    respuesta.json(publicaciones);
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
router.put('/omitirDenunciaUsuario', function(solicitud, respuesta, next) {  
      var consulta=db.query("UPDATE Denuncia SET borrado_logico=? where id_Denuncia=?",[1,solicitud.body.id_Denuncia],function(error,usuariosDenuncias){
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
router.put('/actualizarPublicacion', function(solicitud, respuesta, next) {   
  //console.log(solicitud.body);         
  var consulta1=db.query('UPDATE Publicacion SET revision=?, razon=? WHERE id_Publicacion=?',[solicitud.body.variable,solicitud.body.razon,solicitud.body.id_Publicacion],function(error,resBD){
    if(error){
      console.log(error); 
    }else{                     
      respuesta.json("Publicacion");                                               
    }                            
  });
});  
router.put('/restaurar_contrasena', function(solicitud, respuesta, next) {
          var consulta1=db.query('UPDATE Usuario SET contrasena=? WHERE id_Usuario=?',[solicitud.body.cedula,solicitud.body.id],function(error,resBD){
            if(error){
                console.log(error);
                respuesta.json(error); 
            }else{
              respuesta.json("Se ha restaurado la contraseña correctamente");                
            }
          })
});

router.put('/estado_usuario', function(solicitud, respuesta, next) {  
  //var id=parseInt(solicitud.body.id.toString());  
 // console.log(solicitud.body);
 var razon="";
   var consulta=db.query("SELECT *FROM Usuario WHERE id_Usuario=? and rol!='admin'",[solicitud.body.id],function(error,usuario){
     if(error){
       console.log(error);                  
     }else{
        if(usuario.length>0){          
          var estado=usuario[0].borrado_Logico;  
          var r=1;        
          if(estado==0){
              estado=1;
              r=0;
          }else{
            estado=0;
            r=2;
          }
          var consulta1=db.query('UPDATE Usuario SET borrado_Logico=? WHERE id_Usuario=?',[estado,solicitud.body.id],function(error,res){
            if(error){
                console.log(error); 
            }else{   
              var consulta1=db.query('UPDATE Publicacion SET borrado_Logico=?,revision=?,razon=?  WHERE id_Usuario=?',[estado,r,razon,solicitud.body.id],function(error,resBD){
                if(error){
                  console.log(error); 
                }else{          
                  respuesta.json(estado);                
                }
              });       
            }
          });
        }else{
          respuesta.json("Error al encontrar usuario");
        }        
     }
  });
});
router.put('/inactivarDenuncia', function(solicitud, respuesta, next) {  
  var razon="";
   var consulta=db.query("SELECT *FROM Usuario WHERE id_Usuario=? and rol!='admin'",[solicitud.body.id],function(error,usuario){
     if(error){
       console.log(error);                  
     }else{
        if(usuario.length>0){          
          var consulta1=db.query('UPDATE Usuario SET borrado_Logico=? WHERE id_Usuario=?',[1,solicitud.body.id],function(error,res){
            if(error){
                console.log(error); 
            }else{   
              var consulta1=db.query('UPDATE Publicacion SET borrado_Logico=?,revision=?,razon=? WHERE id_Usuario=?',[1,2,razon,solicitud.body.id],function(error,resBD){
                if(error){
                  console.log(error); 
                }else{   
                  var consulta=db.query("UPDATE Denuncia SET borrado_logico=? where id_Denuncia=?",[1,solicitud.body.id_D],function(error,usuariosDenuncias){
                    if(error){
                      console.log(error);                  
                      respuesta.json(1);  
                    }else{                      
                      respuesta.json("usuario inactivo");
                    }
                  })                         
                }
              });       
            }
          });
        }else{
          respuesta.json("Error al encontrar usuario");
        }        
     }
  });
});
router.post('/mostrar_perfil', function(solicitud, respuesta, next) {
  var mostrarPerfil=db.query('SELECT *FROM Usuario WHERE id_Usuario=?',[solicitud.body.id_Usuario],function(error,res){
    if(error){
      console.log(error); 
    }else{   
      var f=res[0].foto;      
      var f2="data:image/jpeg;base64,"+f.toString();
      res[0].foto=f2;  
      respuesta.json(res);
    }
  })
});
router.post('/mostrarPublicacion', function(solicitud, respuesta, next) {
  var mostrarPerfil=db.query('SELECT *FROM Publicacion WHERE id_Publicacion=?',[solicitud.body.id_PublicacionD],function(error,res){
    if(error){
      console.log(error); 
    }else{   
    //  console.log(res[0].fecha_Encuentro, res[0].fecha_Perdida);
      if(res[0].tipo_Publicacion=="Encuentro"){
        var f=res[0].foto;      
        var f2="data:image/jpeg;base64,"+f.toString();
        res[0].foto=f2;  
      }
      respuesta.json(res);
    }
  })
});

router.put('/inactivarPublicacion', function(solicitud, respuesta, next) {           
  var consulta1=db.query('UPDATE Publicacion SET borrado_Logico=?,revision=?,razon=? WHERE id_Publicacion=?',[1,2,solicitud.body.razon,solicitud.body.id_Publicacion],function(error,resBD){
    if(error){
      console.log(error); 
    }else{   
      var consulta=db.query("UPDATE Denuncia SET borrado_logico=? where id_Denuncia=?",[1,solicitud.body.id_D],function(error,usuariosDenuncias){
        if(error){
          console.log(error);                  
          respuesta.json(1);  
         }else{                      
          respuesta.json("Publicacion inactiva");
                      }
        })                         
    }                            
  });
});
router.get('/cerrar_session', function(req, res, next) {
  delete  req.session.nombre;
  delete  req.session.id;
  //res.redirect(200,'../');
});

return router;
}