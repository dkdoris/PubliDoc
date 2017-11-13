module.exports=function(db){
var express = require('express');
var router = express.Router();

router.post('/iniciarSesion', function(solicitud, respuesta, next) {
   //   console.log(solicitud.body);  
      var iniciarsession=db.query("SELECT *FROM Usuario, Rol_Usuario WHERE cedula=? and contrasena=? and (id_Rol=? or id_Rol=?) and Rol_Usuario.id_Usuario=Usuario.id_Usuario",[solicitud.body.usuario,solicitud.body.contrasena,1,2],function(error,usuario){
        if(error){         
           respuesta.json("1");  
        }else{      
          if(usuario.length>0){              
              solicitud.session.nombre=usuario[0].nombres;
              solicitud.session._id=usuario[0].id_Usuario;                  
              var f=usuario[0].foto;      
              var f2="data:image/jpeg;base64,"+f.toString();
              usuario[0].foto=f2;   
              respuesta.json(usuario);
          }else{
            respuesta.json("-1");
          }
        }
      });      
});

router.get('/listaUsuarios', function(solicitud, respuesta, next) {  
      var consulta=db.query("SELECT *FROM Usuario,Rol,Rol_Usuario WHERE Rol_Usuario.id_Rol!=? and Usuario.id_Usuario=Rol_Usuario.id_Usuario and Rol_Usuario.id_Rol=Rol.id_Rol",[1],function(error,usuarios){
                  if(error){
                    console.log(error);                  
                    respuesta.json(1);  
                  }else{                    
                    respuesta.json(usuarios);
                   }
              })       
});
router.get('/listarPublicaciones', function(solicitud, respuesta, next) {  
      var consulta=db.query("SELECT *FROM Publicacion WHERE revision=0 and borrado_Logico=0",function(error,publicaciones){
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
   var consulta=db.query("SELECT Rol_Usuario.borrado_Logico, Rol_Usuario.id_Rol_Usuario,Rol_Usuario.id_Rol FROM Rol_Usuario,Usuario,Rol WHERE Usuario.id_Usuario=? and Rol_Usuario.id_Rol!=? and Usuario.id_Usuario=Rol_Usuario.id_Usuario and Rol.id_Rol=Rol_Usuario.id_Rol and Rol.tipo=?",[solicitud.body.id,1,solicitud.body.tipo],function(error,usuario){
     if(error){
       console.log(error);                  
     }else{
        if(usuario.length>0){          
          var estado=usuario[0].borrado_Logico;  
          console.log("estado "+estado+" id_Rol_Usuario "+usuario[0].id_Rol_Usuario+" id_Rol "+usuario[0].id_Rol);
          var r=1;        
          if(estado==0){
              estado=1;
              r=0;
          }else{
            estado=0;
            r=0;
          }
          var consulta1=db.query('UPDATE Rol_Usuario SET borrado_Logico=? WHERE id_Usuario=? and id_Rol=?',[estado,solicitud.body.id,usuario[0].id_Rol],function(error,res){
            if(error){
                console.log(error); 
            }else{   
              if (usuario[0].id_Rol==1) {
                var consulta1=db.query('UPDATE Publicacion SET borrado_Logico=?,revision=?,razon=?  WHERE id_Usuario=?',[estado,r,razon,solicitud.body.id],function(error,resBD){
                  if(error){
                    console.log(error); 
                  }else{          
                   // respuesta.json(estado);                
                    var darDeBajaMensaje=db.query('UPDATE Conversacion SET borrado_Logico=?,inicio_Conversacion=? WHERE id_Usuario1=? or id_Usuario2=?', [-1, 0,solicitud.body.id,solicitud.body.id],function(error,resC,filas){
                      if(error){
                        console.log(error);
                      }else{
                        var darDeBajaMensaje=db.query('UPDATE Mensaje SET borrado_Logico=? WHERE id_UsuarioE=?', [-1,solicitud.body.id],function(error,resM,filas){
                          if(error){
                            console.log(error);
                          }else{
                            respuesta.json(estado);   
                          }
                        })
                      }
                    })     
                  }
                });
              }else{
                respuesta.json(estado);  
              }
       
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
   var consulta=db.query("SELECT *FROM Usuario,Rol_Usuario WHERE Usuario.id_Usuario=? and id_Rol=? and Usuario.id_Usuario=Rol_Usuario.id_Usuario",[solicitud.body.id,3],function(error,usuario){
     if(error){
       console.log(error);                  
     }else{
        if(usuario.length>0){          
          var consulta1=db.query('UPDATE Rol_Usuario SET borrado_Logico=? WHERE id_Usuario=? and id_Rol=3',[1,solicitud.body.id],function(error,res){
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
                      var darDeBajaMensaje=db.query('UPDATE Conversacion SET borrado_Logico=?,inicio_Conversacion=? WHERE id_Usuario1=? or id_Usuario2=?', [-1, 0,solicitud.body.id,solicitud.body.id],function(error,resC,filas){
                        if(error){
                          console.log(error);
                        }else{
                          var darDeBajaMensaje=db.query('UPDATE Mensaje SET borrado_Logico=? WHERE id_UsuarioE=?', [-1,solicitud.body.id],function(error,resM,filas){
                            if(error){
                            console.log(error);
                            }else{
                              respuesta.json("usuario inactivo");   
                            }
                          })
                        }
                      })                    
                      //respuesta.json("usuario inactivo");
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
router.post('/cerrar_session', function(req, res, next) {
  //console.log("cerrar_session");
  //console.log(req.body.datos.nombres);
  delete  req.session.nombre;
  delete  req.session.id;
  //res.redirect(200,'../');
  res.json("1");
});

router.get('/verificarSesion', function(solicitud, respuesta, next) {
  //console.log("cerrar_session");
 // console.log(req.body.datos.nombres);
  if (solicitud.session.nombre&&solicitud.session.id) {
    respuesta.json("0");
  }else{
    respuesta.json("1");
  }
});
router.post('/crearUsuario', function(solicitud, respuesta, next) {
  console.log("fecha_Nacimiento "+solicitud.body.fecha_Nacimiento);
  var ms = Date.parse(solicitud.body.fecha_Nacimiento);
  console.log("ms "+ms);
  var todayTime  = new Date(solicitud.body.fecha_Nacimiento);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  var fecha=year + "/" + month + "/" + day; 
  

  var datos=0;
  var buscarUsuario=db.query('SELECT *FROM Usuario WHERE cedula=? or email=?', [solicitud.body.cedula,solicitud.body.email],function(error,resBD){    
    if(error){
      console.log(error);
    }else{
      if (resBD=="") {
          console.log("===================00 "+solicitud.body.fecha_Nacimiento);
  //      datos=-1;
        var crearUsuario=db.query('INSERT INTO Usuario(cedula,nombres,contrasena,fecha_Nacimiento,email,celular,link_Facebook,calificacion_Total,foto,token) VALUES(?,?,?,?,?,?,?,?,?,?)', [solicitud.body.cedula,solicitud.body.nombres,solicitud.body.contrasena,fecha,solicitud.body.email,solicitud.body.celular,solicitud.body.link_Facebook,0,solicitud.body.foto,solicitud.body.token],function(error,res){
          if(error){
            console.log(error);
          }else{  
            
            var crearUsuario1=db.query('INSERT INTO Rol_Usuario(id_Rol,id_Usuario,borrado_Logico) VALUES(?,?,?)', [solicitud.body.tipo,res.insertId,0],function(error,res2){
                if(error){
                  console.log(error);
                }else{           
                  datos=res.insertId;
                  console.log("No tengo ninguna cuenta");
                  //devuelve la respuesta json el servidor
                  respuesta.json(datos);
                } 
            })         
          } 
        })
      }else{
        var crearUsuario2=db.query('SELECT *FROM Rol_Usuario WHERE id_Usuario=? and id_Rol=?', [resBD[0]['id_Usuario'],solicitud.body.tipo],function(error,res1){
          if(error){
            console.log(error);
          }else{  
            if (res1!="") {
              var crearUsuario3=db.query('SELECT *FROM Usuario WHERE cedula=? and email=?', [solicitud.body.cedula,solicitud.body.email],function(error,res7){
                if(error){
                  console.log(error);
                }else{ 
                   if (res7!="") {
                      if (res1[0]['borrado_Logico']==1){
                        console.log("tengo cuenta de usuario bloqueada");
                        respuesta.json(-3);  

                      }else{
                        console.log("tengo cuenta de usuario no bloqueada");
                        respuesta.json(-2);
                      }
                   }else{
                      console.log("Los datos se encuentran en una cuenta");
                      //Cuando ya existe una cuenta creada
                      respuesta.json(datos);
                   }
                } 
              })

            }else{
                  var crearUsuario4=db.query('INSERT INTO Rol_Usuario(id_Rol,id_Usuario,borrado_Logico) VALUES(?,?,?)', [solicitud.body.tipo,resBD[0]['id_Usuario'],0],function(error,res2){
                    if(error){
                      console.log(error);
                    }else{           
                      datos=resBD[0]['id_Usuario'];
                      console.log("tengo cuenta de administrador o mediador pero no tengo cuenta de Usuario");
                      //devuelve la respuesta json el servidor
                      respuesta.json(datos);
                    } 
                  })
            }        
          } 
        })        
      }   
    };
  })

});
router.get('/obtener_TipoUsuario', function(solicitud, respuesta, next) {
  var obtener_TipoUsuario=db.query('SELECT *FROM Rol WHERE id_Rol!=1',function(error,res){
    if(error){
      console.log(error); 
    }else{   
      respuesta.json(res);
    }
  })
});
return router;
}