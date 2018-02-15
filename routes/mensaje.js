module.exports=function(io,db,request){//Importar y exportar módulos a node
//Framewor que utiliza node
var express = require('express'),
//inposta el modulo para trabajar con rutas o direccciones
path=require("path"),
nodemailer=require("nodemailer");
//
var router = express.Router();
//var mysql=require('mysql');//(importar)para acceder a la libreria de mysql desde node
/* GET users listing. */
var connections=[];

var messages={
  message:"hola",
  nombres:"nommbre",
  apellidos:"kakaka"
};
//escuchador y recibe los datos de quien lo llama
//Se conecta el socket y se crea la variable "socket"
io.on('connection',function(socket){
console.log("Se conecto el socket");
    socket.on('idUser',function(data){
    var aux={'id':data,'socket_id':socket.id};
    console.log("Se conecto el usuario "+ socket.id+" id usuario "+ data);
    connections.push(aux);
  });  
  socket.on('disconnect',function(data){    
  connections.splice(connections.indexOf(socket),1);
    console.log('Descenectado % ',data);
  });
});

//***************************************Mostrar Mensajes*******************************************************//
//Realiza una consulta y selecciona contenido,nombres,apellidos,tipo_Mensaje para mostrar la lista de mensajes 
//Verifica si la variable inicio_Conversacion de la tabla Conversacion es igual al id_Usuario que es dueño de la cuenta que ingreso
//En caso de que inicio_Conversacion sea igual a id_Usuario se realiza una consulta para actualizar inicio_Conversacion a cero y saber que se leyo la conversacion nueva
  router.post('/mostrarMensajes', function(solicitud, respuesta, next) {
    if(solicitud.body.id_Conversacion>0){
    var mostrarMensajes=db.query("SELECT contenido,tipo_Mensaje,foto,id_Usuario from Mensaje,Usuario where Mensaje.id_Conversacion=? and  Mensaje.id_UsuarioE=Usuario.id_Usuario and (Mensaje.borrado_Logico!=? and Mensaje.borrado_Logico!=?) order by id_Mensaje",[solicitud.body.id_Conversacion,-1,solicitud.body.id_Usuario],function(error,resBD,filas){
      if(error){
        console.log(error);
      }else{ 
        //Para saber si se ha iniciado una conversacion nueva
        if(resBD!=""){
          var inicio_Conversacion_Consulta=db.query("SELECT inicio_Conversacion from Conversacion where inicio_Conversacion=? and id_Conversacion=?",[solicitud.body.id_Usuario,solicitud.body.id_Conversacion],function(error,resBD2,filas){
            if(error){
              console.log(error);
            }else{ 
              if(resBD2!=""){
                var actualizarConversaciones=db.query('UPDATE Conversacion SET inicio_Conversacion=? WHERE id_Conversacion=? and inicio_Conversacion=?', [0,solicitud.body.id_Conversacion,solicitud.body.id_Usuario],function(error,res,filas){
                  if(error){
                    console.log(error);
                  }else{              
                  }
                })
              }
            }       
          })
        }
        //Transforma en string el resultado de la foto enviado de la consulta pues esta guardada en codigo 64
        var f;
        for (var i = 0; i < resBD.length; i++) {
          f=resBD[i].foto;      
          resBD[i].foto=f.toString();
        };
        respuesta.json(resBD);   //terminar la peticion 
      }  
       
    })
  }else{
    respuesta.json("none");
  }
});
//********************Mostrar lista de mensajes***********************//
//Realiza una consulta para seleccionar la lista de mensajes a ser mostrados
router.post('/listaMensajes', function(solicitud, respuesta, next) {
    var listaMensajes=db.query("SELECT u.id_Usuario,c.id_Conversacion,u.nombres, u.foto,c.inicio_Conversacion FROM Conversacion c, Usuario u WHERE CASE WHEN c.id_Usuario1 = ? THEN c.id_Usuario2 = u.id_Usuario WHEN c.id_Usuario2 = ? THEN c.id_Usuario1= u.id_Usuario END  AND (c.id_Usuario1 =? OR c.id_Usuario2 =?) AND (c.borrado_Logico!=? and c.borrado_Logico!=?)",[solicitud.body.id_Usuario,solicitud.body.id_Usuario,solicitud.body.id_Usuario,solicitud.body.id_Usuario,-1,solicitud.body.id_Usuario],function(error,resBD,filas){
    if(error){
        console.log(error);
    }else{ 
        //Transforma en string el resultado de la foto enviado de la consulta pues esta guardada en codigo 64
        var f;
        for (var i = 0; i < resBD.length; i++) {
          f=resBD[i].foto;      
          resBD[i].foto=f.toString();
        };
        respuesta.json(resBD);   //terminar la peticion 
    }  
 
  })
});
var sendNotificationToUser=function(token,message) {
  var API_KEY = "AAAAOeSNvEc:APA91bGxlzowRwF_NFbDg7vmQGfltqC24VcRF1gcunfx0YOjx0tZdcRzTXNM_67Z3PKM6UDcV8D059j25COi1VFLoYe-zIRUhhlQ7kkwrmgwZWJReDWzr6AhEJSUu6lcyZlqQ861Rc82"; // Your Firebase Cloud Server API key
  request({
    url: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    headers: {
      'Content-Type' :' application/json',
      'Authorization': 'key='+API_KEY
    },
    body: JSON.stringify({
      notification: {        
        title: "Documentos Extraviados",
        icon:"p.png",
        body:message
      },
      data:{
        titulo: "Documentos Extraviados",
        icono:"p.png",
        cuerpo:message
      },
      "to" : token
    })
  }, function(error, response, body) {
    if (error) { console.error(error); }
    else if (response.statusCode >= 400) { 
      console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage); 
    }
    else {
      
    }
  });
};
//******************************Guardar Mensaje*****************************************//
//Primero verifica si el id_Conversacion enviado desde la aplicacion es mayor a cero o igual
//En caso de ser mayor a cero el id_Conversacion se realiza la consulta para seleccionar el borrado_Logico de la tabla de conversacion para saber si es igual a cero, mayor a cero o igual a -1
  //En caso de el borrado_Logico sea igual a cero significa que nadie a borrado la conversacion y por lo tanto solo se ingresa a la tabla Mensaje los mensaje enviados y despues envia el mensaje a usuario destinatario
  //En caso de que borrado_Logico sea maro a cero o igual a -1 significa que el usuario elimino la conversación y por lo talto se realiza la consulta de actualizar el borrado logico para habilitar la conversacion y al inicio de conversacion le asigna el id_Usuario destinatario y despues envia el mensaje a usuario destinatario
//Si el id_Conversacion es igual a cero significa que la conversacion nunca ha existido y por lo tanto realiza la consulta de crear nueva conversacion en la tabla de Conversacion e ingresa los mensajes en la tabla mensajes y por ultimo envia el mensaje a usuario destinatario
router.post('/guardarMensaje', function(solicitud, respuesta, next) {
  var fecha = new Date();
  var hora = fecha.getHours();
  var minuto = fecha.getMinutes()
  var segundo = fecha.getSeconds()
  if (hora < 10) {hora = "0" + hora}
  if (minuto < 10) {minuto = "0" + minuto}
  if (segundo < 10) {segundo = "0" + segundo}
  var horita = hora + ":" + minuto + ":" + segundo
var message=solicitud.body.message;
//console.log("Guardar Mensaje");
//console.log(solicitud.body);
  if(solicitud.body.id_Conversacion>0){
    var seleccionarBorradoLogico=db.query("SELECT borrado_Logico from Conversacion WHERE id_Conversacion=? and ((id_Usuario1=? and id_Usuario2=?)OR(id_Usuario1=? and id_Usuario2=?))",[solicitud.body.id_Conversacion,solicitud.body.id_Usuario,solicitud.body.id_Usuario2,solicitud.body.id_Usuario2,solicitud.body.id_Usuario],function(error,resBL,filas){
      if(error){
          console.log(error);
      }else{ 
          if(resBL[0]['borrado_Logico']==0){
            var GuardarMensaje=db.query("INSERT INTO Mensaje(hora,id_UsuarioE,contenido,id_Conversacion,borrado_Logico,tipo_Mensaje) VALUES(?,?,?,?,?,?)",[horita,solicitud.body.id_Usuario,solicitud.body.message,solicitud.body.id_Conversacion,0,solicitud.body.tipo_Mensaje],function(error,resBD,filas){
              if(error){
                  console.log(error);
              }else{ 
                    connections.forEach(function(u){                        
                      if(u.id==solicitud.body.id_Usuario2){ 
                          console.log(u.socket_id);//
                          //enviar a la persona que debe llegar el mensaje

                        try{ 
                          //Con el socket se envia un mensaje al usuario destinatario
                          io.sockets.to(u.socket_id).emit('new message',{'contenido':solicitud.body.message,'tipo_Mensaje':solicitud.body.tipo_Mensaje,'id_Usuario':solicitud.body.id_Usuario});
                          var seleccionarToken=db.query('SELECT token from Usuario WHERE id_Usuario=?', [solicitud.body.id_Usuario2],function(error,res,filas){
                            if(error){
                              console.log(error);
                            }else{
                              if(res!=""){
                                var mensaje="Nuevo mensaje";
                                var t=res[0]['token']+"";
                                sendNotificationToUser(t,mensaje);
                              }
                            } 
                          })
                        }catch(err){
                          console.log(err);
                        } 
                        return false;
                    }
                    });                  

                  respuesta.json("0");   //terminar la peticion 
              }  
            })
          }else{
            if((resBL[0]['borrado_Logico']==-1)||(resBL[0]['borrado_Logico']>0)){
              var actualizarConversaciones=db.query('UPDATE Conversacion SET borrado_Logico=?, inicio_Conversacion=? WHERE id_Conversacion=?', [0,solicitud.body.id_Usuario2,solicitud.body.id_Conversacion],function(error,res,filas){
                if(error){
                  console.log(error);
                }else{
                  var GuardarMensaje=db.query("INSERT INTO Mensaje(hora,id_UsuarioE,contenido,id_Conversacion,borrado_Logico,tipo_Mensaje) VALUES(?,?,?,?,?,?)",[horita,solicitud.body.id_Usuario,solicitud.body.message,solicitud.body.id_Conversacion,0,solicitud.body.tipo_Mensaje],function(error,resBD,filas){
                    if(error){
                        console.log(error);
                    }else{ 
                         connections.forEach(function(u){                        
                           if(u.id==solicitud.body.id_Usuario2){ 
                              console.log(u.socket_id);//
                          //enviar a la persona que debe llegar el mensaje    
                      try{                       
                      io.sockets.to(u.socket_id).emit('new message',{'contenido':solicitud.body.message,'tipo_Mensaje':solicitud.body.tipo_Mensaje});
                        var seleccionarToken=db.query('SELECT token from Usuario WHERE id_Usuario=?', [solicitud.body.id_Usuario2],function(error,res2,filas){
                            if(error){
                              console.log(error);
                            }else{
                              if(res2!=""){
                                var mensaje="Nuevo mensaje 2";
                                var t=res[0]['token']+"";
                                sendNotificationToUser(t,mensaje);
                              }
                            } 
                        })
                    }catch(err){
                      console.log(err);
                    }
                     return false;
                            }                     
                    });                  

                        respuesta.json("0");   //terminar la peticion 
                    }  
                  })
                  
                }
              })
            }
          }
      }  
   
    })
  }else{   
    var CrearConversacion=db.query("INSERT INTO Conversacion(borrado_Logico,id_Usuario1,id_Usuario2,fecha,inicio_Conversacion) VALUES(?,?,?,?,?)",[0,solicitud.body.id_Usuario,solicitud.body.id_Usuario2,fecha,solicitud.body.id_Usuario2],function(error,res,filas){
      if(error){
          console.log(error);
      }else{ 
        var GuardarMensaje2=db.query("INSERT INTO Mensaje(hora,id_UsuarioE,contenido,id_Conversacion,borrado_Logico,tipo_Mensaje) VALUES(?,?,?,?,?,?)",[horita,solicitud.body.id_Usuario,solicitud.body.message,res.insertId,0,solicitud.body.tipo_Mensaje],function(error,resBD,filas){
          if(error){
              console.log(error);
          }else{ 
              connections.forEach(function(u){                        
                      if(u.id==solicitud.body.id_Usuario2){ 
                          console.log(u.socket_id);//
                          //enviar a la persona que debe llegar el mensaje                      
                      try{                      
                      io.sockets.to(u.socket_id).emit('new message',{'contenido':solicitud.body.message,'tipo_Mensaje':solicitud.body.tipo_Mensaje});
                          var seleccionarToken=db.query('SELECT token from Usuario WHERE id_Usuario=?', [solicitud.body.id_Usuario2],function(error,res2,filas){
                            if(error){
                              console.log(error);
                            }else{
                              if(res2!=""){
                                var mensaje="Nuevo mensaje 2";
                                var t=res[0]['token']+"";
                                sendNotificationToUser(t,mensaje);
                              }
                            } 
                          })                      
                    }catch(err){
                      console.log(err);
                    }


                      
                      return false;
                    }

                    });                  
              respuesta.json(res.insertId);   //terminar la peticion 
          }  
       
        })
      }  
    })  
  }

});

//*****************Dar de Baja Conversacion**************//
//Realiza una consulta para veririficarel valor que tiene el campo borrado_Logico
//Si borrado_Logico es igual a cero significa que nadie a eliminado la conversacion y se realiza la consulta de actualizar en la tabla conversacion el borrado logico y asigna a este el id_Uusuario ademas actualiza en la tabla Mensaje el borrado logico y asigna a este el id_Uusuario
//Si borrado_Logico es mayor a cero y diferente de su id_Usuario esto significa que este aun no ha eliminado la conversacion y se realiza la consulta de actualizar en la tabla conversacion el borrado logico y asigna a este -1 ademas actualiza en la tabla Mensaje el borrado logico y asigna a este el -1 
//El asignar -1 significa que ambos usuario involucrados en la conversacion eliminaron la conversacion
router.post('/darDeBajaConversacion', function(solicitud, respuesta, next) {
    var seleccionarBorradoLogico=db.query("SELECT borrado_Logico from Conversacion WHERE id_Conversacion=?",[solicitud.body.id_Conversacion],function(error,resBL,filas){
      if(error){
          console.log(error);
      }else{ 
        if(resBL[0]['borrado_Logico']==0){
          var darDeBajaMensaje=db.query('UPDATE Conversacion SET borrado_Logico=? WHERE id_Conversacion=?', [solicitud.body.id_Usuario,solicitud.body.id_Conversacion],function(error,resC,filas){
            if(error){
              console.log(error);
            }else{
              var darDeBajaMensaje=db.query('UPDATE Mensaje SET borrado_Logico=? WHERE id_Conversacion=? and borrado_Logico!=?', [solicitud.body.id_Usuario,solicitud.body.id_Conversacion,-1],function(error,res,filas){
                if(error){
                  console.log(error);
                }else{
                  respuesta.json(res);
                }
              })
            }
          })
        }else{
          if((resBL[0]['borrado_Logico']>0)&&(resBL[0]['borrado_Logico']!=solicitud.body.id_Usuario)){
            var darDeBajaMensaje=db.query('UPDATE Conversacion SET borrado_Logico=? WHERE id_Conversacion=?', [-1,solicitud.body.id_Conversacion],function(error,resC,filas){
              if(error){
                console.log(error);
              }else{
                var darDeBajaMensaje=db.query('UPDATE Mensaje SET borrado_Logico=? WHERE id_Conversacion=? and borrado_Logico!=?', [-1,solicitud.body.id_Conversacion,-1],function(error,res,filas){
                  if(error){
                    console.log(error);
                  }else{
                    respuesta.json(res);
                  }
                })
              }
            })
          }
        }
      }
    })
});
//********************Seleccionar id_Conversacion*****************************//
//Realiza una consulta para devolver a la aplicacion el id de conversacion que involucren los id(id_Usuario,id_Usuario2) de usuarios enviados por la aplicacion
router.post('/seleccionarUsuarioConversacion', function(solicitud, respuesta, next) {  
    var mostrarUsuario=db.query("SELECT id_Conversacion from Conversacion WHERE (id_Usuario1=? and id_Usuario2=?)or(id_Usuario1=? and id_Usuario2=?)",[solicitud.body.id_Usuario,solicitud.body.id_Usuario2,solicitud.body.id_Usuario2,solicitud.body.id_Usuario],function(error,columnas,filas){
      if(error){
        console.log(error);
      }else{ 
        respuesta.json(columnas);   //terminar la peticion 
      }

    })
});
//*********************************Selecciona inicio Conversacion*********************************//
//Realiza la consulta para devolver a la aplicacion el inicio_Conversacion, lo cual servira para saber si el usuario dueño de la cuenta tiene una conversacion nueva
router.post('/mostrarNuevoMsj', function(solicitud, respuesta, next) {  
    var mostrarMensajesNuevo=db.query("SELECT inicio_Conversacion from Conversacion where inicio_Conversacion=?",[solicitud.body.idIdentificacion],function(error,resBD,filas){
      if(error){
        console.log(error);
      }else{         
        respuesta.json(resBD);   //terminar la peticion 
      }  
       
    })

});

return  router;
}


