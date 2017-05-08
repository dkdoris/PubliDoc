module.exports=function(io){//Importar y exportar módulos a node
//Framewor que utiliza node
var express = require('express'),
//inposta el modulo para trabajar con rutas o direccciones
path=require("path"),
nodemailer=require("nodemailer");
//
var router = express.Router();
var mysql=require('mysql');//(importar)para acceder a la libreria de mysql desde node
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
// Realiza la coneccion a la base de datos
var conecccion =mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'doris',
    database:'AMPBDP'
});
//se lanza la coneccion o inicia la coneccion con el servidor
conecccion.connect(function(error){
  if(error){
    console.log(error);
      console.log("====ERROR EN LA CONECCION==");
  }else{
      console.log("CONECCION CORRECTA");
  }
});

//creo la ruta
//MOSTRAR USUARIO
//GET obtener datos de la bD
//JSON: vuelve cada objetos de la base de datos en string
//*****************INICIAR SESSION**************//
//realiza una consulta a la base de datos para saber si los datos (cedula y contraseña) ingresados por el usuario pertenecen a alguna cuenta
router.post('/iniciarsession', function(solicitud, respuesta, next) {

  var iniciarsession=conecccion.query("SELECT *FROM Usuario WHERE cedula=? and contrasena=?",[solicitud.body.cedula,solicitud.body.contrasena],function(error,columnas,filas){
      if(error){
        console.log(error);
    }else{
      //devuelve la respuesta json el servidor
        respuesta.json(columnas);
    } 
  })
});


//*****************Mostrar Usuario**************//
//Recibe el id del usuario para hacer una consulta a la base de datos y devuelva los datos del usuario para que sean presentados en la aplicación
router.post('/mostrarUsuario', function(solicitud, respuesta, next) { 
  var mostrarUsuario=conecccion.query("SELECT *FROM Usuario WHERE id_Usuario=?",[solicitud.body.idIdentificacion],function(error,columnas,filas){
    if(error){
      console.log(error);
    }else{      
      respuesta.json(columnas);   //terminar la peticion 
    }  
 
  })
});

//POST envia datos formulariso y los guarda
//SOLICITUD lo que me envian del la aplicaicon
//RESPUESTA: lo que el servidor envio a la aplicaicon
//next: cambiar de metodos
//body transforma filtra toda la informacion enviada desde la aplicacion utilizo el body para sacar la informacion (objeto) puesto toda la informacion enviada del formulario al servidor viene desordenada y con informacion basura.
//*****************Crear Usuario**************//
//Recibe los datos cedula,nombres,apellidos,contrasena,fecha_Nacimiento,email,celular,link_Facebook
//Primero utilizan los datos cedula y email para realizar una consulta a la base de datos y ver si esos datos pertenecen a una cuenta, 
//en caso de que estos datos cohincidan con una cuenta no se podra crear una cuenta de lo contrario
//se ingresaran los datos cedula,nombres,apellidos,contrasena,fecha_Nacimiento,email,celular,link_Facebook,borrado_Logico,calificacion_Total a la base de datos para crear la cuenta
router.post('/crearUsuario', function(solicitud, respuesta, next) {
  var ms = Date.parse(solicitud.body.fecha_Nacimiento);
  var todayTime  = new Date(solicitud.body.fecha_Nacimiento);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  var fecha=year + "/" + month + "/" + day; 
  var cont=0;
  var datos=[];
  var buscarUsuario=conecccion.query('SELECT *FROM Usuario WHERE cedula=? or email=?', [solicitud.body.cedula,solicitud.body.email],function(error,resBD){
    datos[0]=cont;
    if(error){
      console.log(error);
    }else{
      if (resBD=="") {
        cont=1;
        datos[0]=cont;
        var crearUsuario=conecccion.query('INSERT INTO Usuario(cedula,nombres,apellidos,contrasena,fecha_Nacimiento,email,celular,link_Facebook,borrado_Logico,calificacion_Total) VALUES(?,?,?,?,?,?,?,?,?,?)', [solicitud.body.cedula,solicitud.body.nombres,solicitud.body.apellidos,solicitud.body.contrasena,fecha,solicitud.body.email,solicitud.body.celular,solicitud.body.link_Facebook, 0,0],function(error,res){
          if(error){
            console.log(error);
          }else{           
            datos[1]=res.insertId;
            //devuelve la respuesta json el servidor
            respuesta.json(datos);
          } 
        })
      }else{
        
        respuesta.json(datos);
      }   
    };
  })

});

//*****************Modificar Usuario********************//
//Se recibe los datos contraseña, email, celular, link_Facebook y id_Usuario de la aplicación 
//Con el del id_Usuario se verifica cual es la cuenta que hay que modificar una vez seleccionada la cuenta 
//se modificara la cuenta con los siguiente datos contraseña, email, celular, link_Facebook 
router.put('/modificarUsuario', function(solicitud, respuesta, next) {
  var modificarUsuario=conecccion.query('UPDATE Usuario SET contrasena=?,email=?,celular=?,link_Facebook=? WHERE id_Usuario=?', [solicitud.body.contrasena,solicitud.body.email,solicitud.body.celular,solicitud.body.link_Facebook,solicitud.body.id_Usuario],function(error,columnas,filas){
    if(error){
      console.log(error);
  }else{
      respuesta.json(columnas);
  } 
  })
});
//*****************MOSTRAR TIPO DUCUMENTO*****************//
//Realiza una consulta a la base de datos y selecciona todos los documentos personales de la tabla de Documentos 
router.get('/mostrarDocumento', function(solicitud, respuesta, next) {

      var mostrarUsuario=conecccion.query("SELECT *FROM Documento",function(error,respuestaBD){
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
  var todayTime  = new Date(solicitud.body.fecha_Encuentro);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  var fecha=year + "/" + month + "/" + day; 
  var fechaP = new Date();       
  var crearPublicacionE=conecccion.query('INSERT INTO Publicacion(fecha_Publicacion, fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento) VALUES(?,?,?,?,?,?,?,?,?,?)', [fechaP,fecha,solicitud.body.ubicacion_Encuentro,solicitud.body.lugar_Reside,solicitud.body.detalles,solicitud.body.foto,0,solicitud.body.id_Usuario,solicitud.body.tipo_Publicacion,solicitud.body.numero_Documento],function(error,res,filas){
    if(error){
        console.log(error);
    }else{
      //devuelve la respuesta json el servidor tabla intermedia
            for (var i = solicitud.body.id_Documento.length - 1; i >= 0; i--) {
              if(solicitud.body.id_Documento[i]>=1){
                //insertId para poder obtener el id que se guardo recien en la publicacion anterior
                var documentoE=conecccion.query('INSERT INTO Publicacion_Documento(id_Publicacion,id_Documento) VALUES(?,?)', [res.insertId,solicitud.body.id_Documento[i]],function(error,columnas,filas){
                  if(error){
                    console.log(error);
                  }else{
                  } 
                })
              }            
            };    
        respuesta.json("se creo correctamente la PUBLICACION Encuentro");
     }

    })

});
/*********************Crear Publicacion de Perdida*****************/
//Recibe los datos fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento, id_Publicacion,id_Documento
//y junto con el valor del borrado logico para realizar una consulta a la base de datos para guardar la dos datos de la publicacion de perdida en la base de datos
//Primero se ingresa los datos fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento
//a la tabla de publicacion luego recorro el arreglo id_Documento para guardar en la tabla Publicacion_Documento cada id_Docuemento seleccionado por el usuario
router.post('/crearPublicacionP', function(solicitud, respuesta, next) {
    var ms = Date.parse(solicitud.body.fecha_Perdida);
    var todayTime  = new Date(solicitud.body.fecha_Perdida);
    var month = todayTime.getMonth() + 1;
    var day = todayTime.getDate();
    var year = todayTime.getFullYear();
    var fecha=year + "/" + month + "/" + day; 
    var fechaP = new Date();    
var crearPublicacionP=conecccion.query('INSERT INTO Publicacion(fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,borrado_Logico,id_Usuario,tipo_Publicacion,numero_Documento) VALUES(?,?,?,?,?,?,?,?)', [fechaP,fecha,solicitud.body.ubicacion_Perdida,solicitud.body.detalles,0,solicitud.body.id_Usuario,solicitud.body.tipo_Publicacion,solicitud.body.numero_Documento],function(error,res,filas){
    if(error){
      console.log(error);
   }else{
    //devuelve la respuesta json el servidor tabla intermedia
          for (var i = solicitud.body.id_Documento.length - 1; i >= 0; i--) {
            if(solicitud.body.id_Documento[i]>=1){
              var documentoE=conecccion.query('INSERT INTO Publicacion_Documento(id_Publicacion,id_Documento) VALUES(?,?)', [res.insertId,solicitud.body.id_Documento[i]],function(error,columnas,filas){
                if(error){
                  console.log(error);
                }else{
                } 
              })
            }            
          }; 
          respuesta.json("se creo correctamente la PUBLICACION Encuentro");   
  }

  })

});
/**********************LISTA DE MIS PUBLICAICONES**************************/
//Primero con el id_Usuario se selecciona las publicaciones que esten involucrados con ese id y con 
//borrado_Logico se verifica si esta en cero para saber si el usuario la dio de baja y asi no presentar dicha publicacion
//Se envia el resultado de la consulta a la aplicacion los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento para mostrar la lista de publicaciones
router.post('/listaPublicacion', function(solicitud, respuesta, next) { 
      
  var mostrarLista=conecccion.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento from Publicacion where Publicacion.id_Usuario=? and Publicacion.borrado_Logico=?",[solicitud.body.idIdentificacion,0],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      respuesta.json(resBD);   //terminar la peticion 
  } 
  })
});
/*******************************LISTA DE ANUNCIOS*************************************/
//Primero con el id_Usuario se selecciona los anuncios que no tengan que ver con el id enviado por la aplicación 
//borrado_Logico se verifica si esta en cero para saber si algun usuario le dio de baja y asi no presentar dicha anuncio
//Se envia el resultado de la consulta a la aplicacion los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento para mostrar la lista de publicaciones

router.post('/listaAnuncios', function(solicitud, respuesta, next) { 
  var mostrarLista=conecccion.query("SELECT id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento from Publicacion where id_Usuario!=? and borrado_Logico=? and numero_Documento=?",[solicitud.body.idIdentificacion,0,solicitud.body.cedulatenporal],function(error,resBD,filas){
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
  var ms = Date.parse(solicitud.body.fecha_Encuentro);
  var todayTime  = new Date(solicitud.body.fecha_Encuentro);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  var fecha=year + "/" + month + "/" + day; 

      var modificarPublicacionE=conecccion.query('UPDATE Publicacion SET fecha_Encuentro=?,ubicacion_Encuentro=?,lugar_Reside=?,detalles=?,foto=?,numero_Documento=? WHERE id_Publicacion=?', [fecha,solicitud.body.ubicacion_Encuentro,solicitud.body.lugar_Reside,solicitud.body.detalles,solicitud.body.foto,solicitud.body.numero_Documento,solicitud.body.id_Publicacion],function(error,resBD,filas){
        if(error){
          console.log(error);
        }else{
          var modificarPublicacionDoc=conecccion.query('DELETE FROM Publicacion_Documento WHERE id_Publicacion=?',[solicitud.body.id_Publicacion],function(error,res,filas){
            if(error){
              console.log(error);
            }else{
              //RECORRE EL EL ARREGLO ENVIADO DESDE LA APLICACION PARA guardar en la BD
              for (var i = solicitud.body.id_Documento.length - 1; i >= 0; i--) {
                if(solicitud.body.id_Documento[i]>=1){
                  //insertId para poder obtener el ide que se guardo recuien en la publicacion anterior
                  var documentoE=conecccion.query('INSERT INTO Publicacion_Documento(id_Publicacion,id_Documento) VALUES(?,?)', [solicitud.body.id_Publicacion,solicitud.body.id_Documento[i]],function(error,columnas,filas){
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
  var ms = Date.parse(solicitud.body.fecha_Perdida);
  var todayTime  = new Date(solicitud.body.fecha_Perdida);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  var fecha=year + "/" + month + "/" + day; 
  var modificarPublicacionE=conecccion.query('UPDATE Publicacion SET fecha_Perdida=?,ubicacion_Perdida=?,detalles=?,numero_Documento=? WHERE id_Publicacion=?', [fecha,solicitud.body.ubicacion_Perdida,solicitud.body.detalles,solicitud.body.numero_Documento,solicitud.body.id_Publicacion],function(error,resBD,filas){
    if(error){
      console.log(error);
  }else{
      var modificarPublicacionDoc=conecccion.query('DELETE FROM Publicacion_Documento WHERE id_Publicacion=?',[solicitud.body.id_Publicacion],function(error,res,filas){
        if(error){
          console.log(error);
      }else{
        //RECORRE EL EL ARREGLO ENVIADO DESDE LA APLICACION PARA guardar en la BD
        for (var i = solicitud.body.id_Documento.length - 1; i >= 0; i--) {
          if(solicitud.body.id_Documento[i]>=1){
            //insertId para poder obtener el ide que se guardo recuien en la publicacion anterior
            var documentoE=conecccion.query('INSERT INTO Publicacion_Documento(id_Publicacion,id_Documento) VALUES(?,?)', [solicitud.body.id_Publicacion,solicitud.body.id_Documento[i]],function(error,columnas,filas){
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
})});

//*****************Mostrar Publicación Encuentro**************//
//Selecciona los datos id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento,id_Usuario de la tabla Publicación
//además id_Documento de la tabla Publicacion_Documento y nombre_Documento de ta tabla Documento de la publicacion de Encuentro seleccionada
//Tomando en cuenta que que en la tabla Publicacion el id_Publicacion y id_Usuario pertenescan a los datos enviados desde la aplicación 
//Y que el borrado logico de la publicación tenga el valor de cero para poder presentarla 
//De la tabla de Publicacion_Documento se ve si el id_Publicacion sea igual al id de publicacion ingersado y el id_Documento de esta tabla sea igual al id_Documento de la tabla Documento
router.post('/mostrarPublicacionE', function(solicitud, respuesta, next) { 
  var mostrarPublicacionE=conecccion.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento,id_Usuario,Publicacion_Documento.id_Documento,nombre_Documento from Publicacion,Publicacion_Documento,Documento where Publicacion.id_Publicacion=? and Publicacion.id_Usuario=? and Publicacion.borrado_Logico=? and Publicacion_Documento.id_Publicacion=Publicacion.id_Publicacion and Publicacion_Documento.id_Documento=Documento.id_Documento",[solicitud.body.idIdentificacionP,solicitud.body.idIdentificacion,0],function(error,resBD,filas){
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
  var mostrarUsuario=conecccion.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,numero_Documento,id_Usuario,Publicacion_Documento.id_Documento,nombre_Documento from Publicacion,Publicacion_Documento,Documento where Publicacion.id_Publicacion=? and Publicacion.id_Usuario=? and Publicacion.borrado_Logico=? and Publicacion_Documento.id_Publicacion=Publicacion.id_Publicacion and Publicacion_Documento.id_Documento=Documento.id_Documento",[solicitud.body.idIdentificacionP,solicitud.body.idIdentificacion,0],function(error,resBD,filas){
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
  var modificarUsuario=conecccion.query('UPDATE Publicacion SET borrado_Logico=? WHERE id_Publicacion=?', [1,solicitud.body.idIdentificacionP],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      respuesta.json(resBD);
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
  var mostrarAnuncioE=conecccion.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Encuentro,ubicacion_Encuentro,lugar_Reside,detalles,foto,numero_Documento,id_Usuario,Publicacion_Documento.id_Documento,nombre_Documento from Publicacion,Publicacion_Documento,Documento where Publicacion.id_Publicacion=? and Publicacion.id_Usuario!=?  and Publicacion.borrado_Logico=? and Publicacion_Documento.id_Publicacion=Publicacion.id_Publicacion and Publicacion_Documento.id_Documento=Documento.id_Documento",[solicitud.body.idIdentificacionP,solicitud.body.idIdentificacion,0],function(error,resBD,filas){
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
  var mostrarAnuncioP=conecccion.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,fecha_Perdida,ubicacion_Perdida,detalles,numero_Documento,id_Usuario,Publicacion_Documento.id_Documento,nombre_Documento from Publicacion,Publicacion_Documento,Documento where Publicacion.id_Publicacion=? and Publicacion.id_Usuario!=? and Publicacion.borrado_Logico=? and Publicacion_Documento.id_Publicacion=Publicacion.id_Publicacion and Publicacion_Documento.id_Documento=Documento.id_Documento",[solicitud.body.idIdentificacionP,solicitud.body.idIdentificacion,0],function(error,resBD,filas){
    if(error){
      console.log(error);
  }else{      
      respuesta.json(resBD);   //terminar la peticion 
  }  
 
})});
//*****************Ver Usuario y Enviar email a usuario dueno del anuncio**************//
//Selecciona el la informacion del usuario que no ingresa a la aplicacion, a quien le pertenece el anuncio visto por el usuario que ingreso a la aplicacion para presentarla en la misma
//Despues se selecciona el email del usuario que ingreso a la aplicacion para enviarle un mensaje a su cuenta de la informacion del usuario que emitio el anuncio
//Posteriormente la condicion siguiente indica si el usuario a quien le pertenece la cuenta se quiere poner en contacto con el usuario que emitio el anuncio
//Si la condicion se cumple se seleciona todos los campos la tabla Calificacion para saber si ya exite algun registro de calificacion que involucre dicha publicación
//En caso de no existir un registro de calificacion se inserta uno para que se el usuario dueño de la cuenta pueda calificar el anuncio del usuario que lo emitio
//Finalmente envia un gmail (con la informacion email, celular, link_Facebook) al usuario que se puso en contacto con el usuario que emitio el anuncio 
router.post('/verUsuario', function(solicitud, respuesta, next) { 
  var verUsuario=conecccion.query("SELECT *from Usuario, Publicacion WHERE Publicacion.id_Publicacion=? and Publicacion.id_Usuario=Usuario.id_Usuario",[solicitud.body.id_Publicacion],function(error,resBD,filas){
    if(error){
      console.log(error); 
    }else{ 
      
      var verUsu=conecccion.query("SELECT email from Usuario WHERE id_Usuario=?",[solicitud.body.id_UsuarioC],function(error,resBD2,filas){
        if(error){
          console.log(error); 
        }else{
          //aceptar es para ver si entro a la funcion de clic 
          if(solicitud.body.aceptar>=2){

            var calificarUsuario=conecccion.query("SELECT *FROM Calificacion WHERE id_Publicacion=? and id_UsuarioP=? and id_UsuarioC=?",[solicitud.body.id_Publicacion,resBD[0]['id_Usuario'],solicitud.body.id_UsuarioC],function(error,res,filas){
              if(error){
                console.log(error);
              }else{ 
                if(res==""){
                  var ingresarCalificacion=conecccion.query('INSERT INTO Calificacion(id_Publicacion,id_UsuarioP,id_UsuarioC,calif) VALUES(?,?,?,?)', [solicitud.body.id_Publicacion,resBD[0]['id_Usuario'],solicitud.body.id_UsuarioC,0],function(error,columnas,filas){
                    if(error){
                      console.log(error);
                    }else{
                    } 
                  })
                } 
              }
            }) 

            var cadenaEmail='<strong>Email: </strong>';
            cadenaEmail=cadenaEmail+resBD[0]['email'];
            var cadenaCelular='<strong><br/>Celular: </strong>';
            cadenaEmail=cadenaEmail+cadenaCelular+resBD[0]['celular'];
            var cadenaLinkFace='<strong><br/>Link de Facebook: <br/></strong>';
            cadenaEmail=cadenaEmail+cadenaLinkFace+resBD[0]['link_Facebook'];
            var nodeM=nodemailer.createTransport("smtps://karyto743@gmail.com:743rya347@smtp.gmail.com");

            var mailOpciones={
              //Envia desde el la cuenta
              from:"karyto743@gmail.com",
              //Al email destinatorio
              to:resBD2[0]['email'], 
              //La siguiente descripcion
              subject:"Mi asunto",
              //La informacion email, celular, link_Facebook
              html:cadenaEmail      
            }
            //Envia mailOpciones al gmail del usuario  
            nodeM.sendMail(mailOpciones,function(error,respuesta){
            if(error){
              console.log(error+"asdasd");
            }else{
              console.log("Email enviado con exito");
            }
          });
        }else{
        }
        respuesta.json(resBD);   //terminar la peticion 

        }
      })
    }   
  })
});
//*****************Buscar Publicaciones**************//
//Busca las publicaciones que le pertenecen al usuario dueño ed la cuenta y que involucran el numero de cedula 
// Tomado en cuenta que el borrado lógico esta en cero esto indica que las publicaciones no este dadas de baja
router.post('/buscarPublicacion', function(solicitud, respuesta, next) { 
  var buscarPubli=conecccion.query("SELECT Publicacion.id_Publicacion,tipo_Publicacion,fecha_Publicacion,numero_Documento from Publicacion where id_Usuario=? and borrado_Logico=? and numero_Documento=?",[solicitud.body.idIdentificacion,0,solicitud.body.cedulatenporal],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{
      
      respuesta.json(resBD);   //terminar la peticion 
  } 
  })
});
//Algoritmo para generar la contraseña momentanea para recuperar la contraseña
var generarContrasena=function(){
  var n=(Math.random()*35675).toFixed(0);
  return n;
};
//***********************Recuperar Contraseña**************************//
//Primero verifica si la informacion ingresada por el usuario es correta y pertenecen a la misma cuenta
//Despues envia la informacion de la nueva contraseña momentanea al usuario que quiere recuperar la contraseña
//Finalmente Actualiza el campo de contraseña para que el usuario pueda ingresar y cambiar la contraseña de su cuenta
router.post('/enviarInfoUsuario',function(solicitud,respuesta){

    var email=solicitud.body.email;
    var validarEmail=conecccion.query("SELECT *FROM Usuario WHERE cedula=? and email=?",[solicitud.body.cedula,email],function(error,res,filas){
      if(error){
        console.log(error);
      }else{
        if(res!=""){
          var contrasena=generarContrasena();
          var cadenaContrasena='<strong>Contraseña: </strong>';
          cadenaContrasena=cadenaContrasena+contrasena;
          var nodeM=nodemailer.createTransport("smtps://karyto743@gmail.com:743rya347@smtp.gmail.com");
          var mailOpciones={
            from:"karyto743@gmail.com",
            to:email, 
            subject:"Mi asunto",
            html:cadenaContrasena      
          }
          nodeM.sendMail(mailOpciones,function(error,respuesta){
            if(error){
              console.log(error+"asdasd");
            }else{
              console.log("Email enviado con exito");
            }
          });
          var modificarUsuario=conecccion.query('UPDATE Usuario SET contrasena=? WHERE id_Usuario=?', [contrasena,res[0]['id_Usuario']],function(error,columnas,filas){
            if(error){
                console.log(error);
            }else{            
            } 
          })
          respuesta.json(res);
        }else{
          respuesta.json("");
        }
          
      }  
    }) 
});
//***************************Ver si existe calficicación****************************************//
//Recibe el id_Publicación para poder seleccionar toda la informacion del usuario y publicación  perteneciente a dicha publicación
//Usa el id_Usuario de la consulta anterior para seleccionar la calificacion que tiene tal anuncio todo esto es para saber si el anuncio tiene alguna calificacion mayor a uno 
router.post('/verificarCalificacion',function(solicitud,respuesta){
//Para obtener el id del usuario que Publica
  var verUsuario=conecccion.query("SELECT *from Usuario, Publicacion WHERE Publicacion.id_Publicacion=? and Publicacion.id_Usuario=Usuario.id_Usuario",[solicitud.body.id_Publicacion],function(error,resBD,filas){
    if(error){
      console.log(error); 
    }else{ 
      var verificarUsuario=conecccion.query("SELECT *FROM Calificacion WHERE id_Publicacion=? and id_UsuarioP=? and id_UsuarioC=?",[solicitud.body.id_Publicacion,resBD[0]['id_Usuario'],solicitud.body.id_UsuarioC],function(error,res,filas){
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
  var modificarUsuario=conecccion.query('UPDATE Calificacion SET calif=? WHERE id_Publicacion=? and id_UsuarioP=? and id_UsuarioC=?', [solicitud.body.valorC,solicitud.body.id_Publicacion,solicitud.body.id_UsuarioP,solicitud.body.id_UsuarioC],function(error,resBD,filas){
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
    var promedioCalificacion=conecccion.query('SELECT avg(calif) from Calificacion WHERE id_UsuarioP=?', [solicitud.body.id_UsuarioP],function(error,res,filas){
      if(error){
        console.log(error);
      }else{
        respuesta.json(res);
      }
    })
  });
//***************************************Mostrar Mensajes*******************************************************//
//Realiza una consulta y selecciona contenido,nombres,apellidos,tipo_Mensaje para mostrar la lista de mensajes 
//Verifica si la variable inicio_Conversacion de la tabla Conversacion es igual al id_Usuario que es dueño de la cuenta que ingreso
//En caso de que inicio_Conversacion sea igual a id_Usuario se realiza una consulta para actualizar inicio_Conversacion a cero y saber que se leyo la conversacion nueva
  router.post('/mostrarMensajes', function(solicitud, respuesta, next) {
    if(solicitud.body.id_Conversacion>0){
    var mostrarMensajes=conecccion.query("SELECT contenido,nombres,apellidos,tipo_Mensaje from Mensaje,Usuario where Mensaje.id_Conversacion=? and  Mensaje.id_UsuarioE=Usuario.id_Usuario and (Mensaje.borrado_Logico!=? and Mensaje.borrado_Logico!=?) order by id_Mensaje",[solicitud.body.id_Conversacion,-1,solicitud.body.id_Usuario],function(error,resBD,filas){
      if(error){
        console.log(error);
      }else{ 
        //Para saber si se ha iniciado una conversacion nueva
        if(resBD!=""){
          var inicio_Conversacion_Consulta=conecccion.query("SELECT inicio_Conversacion from Conversacion where inicio_Conversacion=? and id_Conversacion=?",[solicitud.body.id_Usuario,solicitud.body.id_Conversacion],function(error,resBD2,filas){
            if(error){
              console.log(error);
            }else{ 
              if(resBD2!=""){
                var actualizarConversaciones=conecccion.query('UPDATE Conversacion SET inicio_Conversacion=? WHERE id_Conversacion=? and inicio_Conversacion=?', [0,solicitud.body.id_Conversacion,solicitud.body.id_Usuario],function(error,res,filas){
                  if(error){
                    console.log(error);
                  }else{              
                  }
                })
              }
            }       
          })
        }

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
    var listaMensajes=conecccion.query("SELECT u.id_Usuario,c.id_Conversacion,u.nombres,u.apellidos FROM Conversacion c, Usuario u WHERE CASE WHEN c.id_Usuario1 = ? THEN c.id_Usuario2 = u.id_Usuario WHEN c.id_Usuario2 = ? THEN c.id_Usuario1= u.id_Usuario END  AND (c.id_Usuario1 =? OR c.id_Usuario2 =?) AND (c.borrado_Logico!=? and c.borrado_Logico!=?)",[solicitud.body.id_Usuario,solicitud.body.id_Usuario,solicitud.body.id_Usuario,solicitud.body.id_Usuario,-1,solicitud.body.id_Usuario],function(error,resBD,filas){
    if(error){
        console.log(error);
    }else{ 
        respuesta.json(resBD);   //terminar la peticion 
    }  
 
  })
});
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
  if(solicitud.body.id_Conversacion>0){
    var seleccionarBorradoLogico=conecccion.query("SELECT borrado_Logico from Conversacion WHERE id_Conversacion=? and ((id_Usuario1=? and id_Usuario2=?)OR(id_Usuario1=? and id_Usuario2=?))",[solicitud.body.id_Conversacion,solicitud.body.id_Usuario,solicitud.body.id_Usuario2,solicitud.body.id_Usuario2,solicitud.body.id_Usuario],function(error,resBL,filas){
      if(error){
          console.log(error);
      }else{ 
          if(resBL[0]['borrado_Logico']==0){
            var GuardarMensaje=conecccion.query("INSERT INTO Mensaje(hora,id_UsuarioE,contenido,id_Conversacion,borrado_Logico,tipo_Mensaje) VALUES(?,?,?,?,?,?)",[horita,solicitud.body.id_Usuario,solicitud.body.message,solicitud.body.id_Conversacion,0,solicitud.body.tipo_Mensaje],function(error,resBD,filas){
              if(error){
                  console.log(error);
              }else{ 
                    connections.forEach(function(u){                        
                      if(u.id==solicitud.body.id_Usuario2){ 
                          console.log(u.socket_id);//
                          //enviar a la persona que debe llegar el mensaje

                        try{ 
                          //Con el socket se envia un mensaje al usuario destinatario
                          io.sockets.to(u.socket_id).emit('new message',{'contenido':solicitud.body.message,'nombres':solicitud.body.nombres,'apellidos':solicitud.body.apellidos,'tipo_Mensaje':solicitud.body.tipo_Mensaje});
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
              var actualizarConversaciones=conecccion.query('UPDATE Conversacion SET borrado_Logico=?, inicio_Conversacion=? WHERE id_Conversacion=?', [0,solicitud.body.id_Usuario2,solicitud.body.id_Conversacion],function(error,res,filas){
                if(error){
                  console.log(error);
                }else{
                  var GuardarMensaje=conecccion.query("INSERT INTO Mensaje(hora,id_UsuarioE,contenido,id_Conversacion,borrado_Logico,tipo_Mensaje) VALUES(?,?,?,?,?,?)",[horita,solicitud.body.id_Usuario,solicitud.body.message,solicitud.body.id_Conversacion,0,solicitud.body.tipo_Mensaje],function(error,resBD,filas){
                    if(error){
                        console.log(error);
                    }else{ 
                         connections.forEach(function(u){                        
                           if(u.id==solicitud.body.id_Usuario2){ 
                              console.log(u.socket_id);//
                          //enviar a la persona que debe llegar el mensaje    
                      try{                       
                      io.sockets.to(u.socket_id).emit('new message',{'contenido':solicitud.body.message,'nombres':solicitud.body.nombres,'apellidos':solicitud.body.apellidos,'tipo_Mensaje':solicitud.body.tipo_Mensaje});
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
    var CrearConversacion=conecccion.query("INSERT INTO Conversacion(borrado_Logico,id_Usuario1,id_Usuario2,fecha,inicio_Conversacion) VALUES(?,?,?,?,?)",[0,solicitud.body.id_Usuario,solicitud.body.id_Usuario2,fecha,solicitud.body.id_Usuario2],function(error,res,filas){
      if(error){
          console.log(error);
      }else{ 
        var GuardarMensaje2=conecccion.query("INSERT INTO Mensaje(hora,id_UsuarioE,contenido,id_Conversacion,borrado_Logico,tipo_Mensaje) VALUES(?,?,?,?,?,?)",[horita,solicitud.body.id_Usuario,solicitud.body.message,res.insertId,0,solicitud.body.tipo_Mensaje],function(error,resBD,filas){
          if(error){
              console.log(error);
          }else{ 
              connections.forEach(function(u){                        
                      if(u.id==solicitud.body.id_Usuario2){ 
                          console.log(u.socket_id);//
                          //enviar a la persona que debe llegar el mensaje                      
                      try{                      
                      io.sockets.to(u.socket_id).emit('new message',{'contenido':solicitud.body.message,'nombres':solicitud.body.nombres,'apellidos':solicitud.body.apellidos,'tipo_Mensaje':solicitud.body.tipo_Mensaje});
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
    var seleccionarBorradoLogico=conecccion.query("SELECT borrado_Logico from Conversacion WHERE id_Conversacion=?",[solicitud.body.id_Conversacion],function(error,resBL,filas){
      if(error){
          console.log(error);
      }else{ 
        if(resBL[0]['borrado_Logico']==0){
          var darDeBajaMensaje=conecccion.query('UPDATE Conversacion SET borrado_Logico=? WHERE id_Conversacion=?', [solicitud.body.id_Usuario,solicitud.body.id_Conversacion],function(error,resC,filas){
            if(error){
              console.log(error);
            }else{
              var darDeBajaMensaje=conecccion.query('UPDATE Mensaje SET borrado_Logico=? WHERE id_Conversacion=?', [solicitud.body.id_Usuario,solicitud.body.id_Conversacion],function(error,res,filas){
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
            var darDeBajaMensaje=conecccion.query('UPDATE Conversacion SET borrado_Logico=? WHERE id_Conversacion=?', [-1,solicitud.body.id_Conversacion],function(error,resC,filas){
              if(error){
                console.log(error);
              }else{
                var darDeBajaMensaje=conecccion.query('UPDATE Mensaje SET borrado_Logico=? WHERE id_Conversacion=?', [-1,solicitud.body.id_Conversacion],function(error,res,filas){
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
//Realiza una consulta para devolver a la aplicacion el id ce conversacion que involucren los id(id_Usuario,id_Usuario2) de usuarios enviados por la aplicacion
router.post('/seleccionarUsuarioConversacion', function(solicitud, respuesta, next) {  
    var mostrarUsuario=conecccion.query("SELECT id_Conversacion from Conversacion WHERE (id_Usuario1=? and id_Usuario2=?)or(id_Usuario1=? and id_Usuario2=?)",[solicitud.body.id_Usuario,solicitud.body.id_Usuario2,solicitud.body.id_Usuario2,solicitud.body.id_Usuario],function(error,columnas,filas){
      if(error){
        console.log(error);
      }else{ 
        respuesta.json(columnas);   //terminar la peticion 
      }

    })
});
//*******************************Selecionar emial, nomrbe s y apellidos de Usuario*****************************************//
//Realiza la consulta para devolver a la aplicacion los datos (email,nombres,apellidos) de un usuario tomando en cuenta el id_Usuario enviado por la aplicaicon
router.post('/obtenerInfoUser', function(solicitud, respuesta, next) { 
  var obtenerInfoUser=conecccion.query("SELECT email,nombres,apellidos FROM Usuario WHERE id_Usuario=?",[solicitud.body.idIdentificacion],function(error,columnas,filas){
    if(error){
      console.log(error);
    }else{      
      respuesta.json(columnas);   //terminar la peticion 
    }  
  })
});
//*********************************Selecciona inicio Conversacion*********************************//
//Realiza la consulta para devolver a la aplicacion el inicio_Conversacion, lo cual servira para saber si el usuario dueño de la cuenta tiene una conversacion nueva
//
router.post('/mostrarNuevoMsj', function(solicitud, respuesta, next) {
    var mostrarMensajesNuevo=conecccion.query("SELECT inicio_Conversacion from Conversacion where inicio_Conversacion=?",[solicitud.body.idIdentificacion],function(error,resBD,filas){
      if(error){
        console.log(error);
      }else{ 
        respuesta.json(resBD);   //terminar la peticion 
      }  
       
    })

});

return  router;
}


