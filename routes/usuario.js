
module.exports=function(db){//Importar y exportar módulos a node
//Framewor que utiliza node
var express = require('express'),
//inposta el modulo para trabajar con rutas o direccciones
path=require("path"),
nodemailer=require("nodemailer");
//
var router = express.Router();
var mysql=require('mysql');//(importar)para acceder a la libreria de mysql desde node
// Realiza la coneccion a la base de datos

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//creo la ruta
//MOSTRAR USUARIO
//GET obtener datos de la bD
//JSON: vuelve cada objetos de la base de datos en string
//*****************INICIAR SESSION**************//
//realiza una consulta a la base de datos para saber si los datos (cedula y contraseña) ingresados por el usuario pertenecen a alguna cuenta
router.post('/iniciarsession', function(solicitud, respuesta, next) {

  var iniciarsession=db.query("SELECT *FROM Usuario WHERE cedula=? and contrasena=?",[solicitud.body.cedula,solicitud.body.contrasena],function(error,columnas,filas){
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
  var mostrarUsuario=db.query("SELECT *FROM Usuario WHERE id_Usuario=?",[solicitud.body.idIdentificacion],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{ 
      var f=resBD[0].foto;      
      resBD[0].foto=f.toString(); 
      respuesta.json(resBD);   //terminar la peticion 
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
  var buscarUsuario=db.query('SELECT *FROM Usuario WHERE cedula=? or email=?', [solicitud.body.cedula,solicitud.body.email],function(error,resBD){
    datos[0]=cont;
    if(error){
      console.log(error);
    }else{
      if (resBD=="") {
        cont=1;
        datos[0]=cont;
        var crearUsuario=db.query('INSERT INTO Usuario(cedula,nombres,apellidos,contrasena,fecha_Nacimiento,email,celular,link_Facebook,borrado_Logico,calificacion_Total,foto,rol) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', [solicitud.body.cedula,solicitud.body.nombres,solicitud.body.apellidos,solicitud.body.contrasena,fecha,solicitud.body.email,solicitud.body.celular,solicitud.body.link_Facebook, 0,0,solicitud.body.foto,solicitud.body.rol],function(error,res){
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
  //Busca si existe el correo ingresado es el mismo
  var buscarEmail=db.query('SELECT email FROM Usuario WHERE id_Usuario=? and email=?', [solicitud.body.id_Usuario,solicitud.body.email],function(error,resBD){
    if(error){
        console.log(error);
    }else{
      //si resBD es igual a "" es que el email igresado no es igual caso contrario si
        if((resBD!="")){ 
        //Actualiza los datos      
          var modificarUsuario=db.query('UPDATE Usuario SET contrasena=?,email=?,celular=?,link_Facebook=?,foto=? WHERE id_Usuario=?', [solicitud.body.contrasena,solicitud.body.email,solicitud.body.celular,solicitud.body.link_Facebook,solicitud.body.foto,solicitud.body.id_Usuario],function(error,resBD2,filas){
            if(error){
              console.log(error);
            }else{              
              respuesta.json("1"); 
            } 
          })
        }else{
          //Verifica que el email ingresado sea unico
          var verificarEmail=db.query('SELECT email FROM Usuario WHERE email=?', [solicitud.body.email],function(error,resBD1){
              if(error){
                console.log(error);
              }else{  
                //El email no se encontro en la base de datos si resBD1 es igual a "" caso contrario el email pertenece a otra cuenta
                if(resBD1=="") {
                  var modificarUsuario=db.query('UPDATE Usuario SET contrasena=?,email=?,celular=?,link_Facebook=?,foto=? WHERE id_Usuario=?', [solicitud.body.contrasena,solicitud.body.email,solicitud.body.celular,solicitud.body.link_Facebook,solicitud.body.foto,solicitud.body.id_Usuario],function(error,resBD3,filas){
                    if(error){
                      console.log(error);
                    }else{              
                      respuesta.json("1"); 
                    } 
                  })
                }else  {
                  respuesta.json("0");     
                } 
              }
          })
        }
    } 
  })
});
//*****************Ver Usuario y Enviar email a usuario dueno del anuncio**************//
//Selecciona el la informacion del usuario que no ingresa a la aplicacion, a quien le pertenece el anuncio visto por el usuario que ingreso a la aplicacion para presentarla en la misma
//Despues se selecciona el email del usuario que ingreso a la aplicacion para enviarle un mensaje a su cuenta de la informacion del usuario que emitio el anuncio
//Posteriormente la condicion siguiente indica si el usuario a quien le pertenece la cuenta se quiere poner en contacto con el usuario que emitio el anuncio
//Si la condicion se cumple se seleciona todos los campos la tabla Calificacion para saber si ya exite algun registro de calificacion que involucre dicha publicación
//En caso de no existir un registro de calificacion se inserta uno para que se el usuario dueño de la cuenta pueda calificar el anuncio del usuario que lo emitio
//Finalmente envia un gmail (con la informacion email, celular, link_Facebook) al usuario que se puso en contacto con el usuario que emitio el anuncio 
router.post('/verUsuario', function(solicitud, respuesta, next) { 
  var verUsuario=db.query("SELECT Usuario.nombres,Usuario.apellidos,Usuario.cedula,Usuario.foto,Usuario.email,Usuario.celular,Usuario.link_Facebook,Usuario.id_Usuario from Usuario, Publicacion WHERE Publicacion.id_Publicacion=? and Publicacion.id_Usuario=Usuario.id_Usuario",[solicitud.body.id_Publicacion],function(error,resBD,filas){
    if(error){
      console.log(error); 
    }else{ 
      var verUsu=db.query("SELECT email from Usuario WHERE id_Usuario=?",[solicitud.body.id_UsuarioC],function(error,resBD2,filas){
        if(error){
          console.log(error); 
        }else{
          //aceptar es para ver si entro a la funcion de clic 
          if(solicitud.body.aceptar>=2){

            var calificarUsuario=db.query("SELECT *FROM Calificacion WHERE id_Publicacion=? and id_UsuarioP=? and id_UsuarioC=?",[solicitud.body.id_Publicacion,resBD[0]['id_Usuario'],solicitud.body.id_UsuarioC],function(error,res,filas){
              if(error){
                console.log(error);
              }else{ 
                if(res==""){
                  var ingresarCalificacion=db.query('INSERT INTO Calificacion(id_Publicacion,id_UsuarioP,id_UsuarioC,calif) VALUES(?,?,?,?)', [solicitud.body.id_Publicacion,resBD[0]['id_Usuario'],solicitud.body.id_UsuarioC,0],function(error,columnas,filas){
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
        }
        var f=resBD[0].foto;      
        resBD[0].foto=f.toString(); 
        
        respuesta.json(resBD);   //terminar la peticion 

        }
      })
    }   
  })
});

//Algoritmo para generar la contraseña momentanea para recuperar la contraseña
var generarContrasena=function(){
  var n=(Math.random()*356757).toFixed(0);
  return n;
};
//***********************Recuperar Contraseña**************************//
//Primero verifica si la informacion ingresada por el usuario es correta y pertenecen a la misma cuenta
//Despues envia la informacion de la nueva contraseña momentanea al usuario que quiere recuperar la contraseña
//Finalmente Actualiza el campo de contraseña para que el usuario pueda ingresar y cambiar la contraseña de su cuenta
router.post('/enviarInfoUsuario',function(solicitud,respuesta){

    var email=solicitud.body.email;
    var validarEmail=db.query("SELECT *FROM Usuario WHERE cedula=? and email=?",[solicitud.body.cedula,email],function(error,res,filas){
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
          var modificarUsuario=db.query('UPDATE Usuario SET contrasena=? WHERE id_Usuario=?', [contrasena,res[0]['id_Usuario']],function(error,columnas,filas){
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
//*******************************Selecionar emil, nombres y apellidos de Usuario*****************************************//
//Realiza la consulta para devolver a la aplicacion los datos (email,nombres,apellidos) de un usuario tomando en cuenta el id_Usuario enviado por la aplicaicon
router.post('/obtenerInfoUser', function(solicitud, respuesta, next) { 
  var obtenerInfoUser=db.query("SELECT email,nombres,apellidos,foto FROM Usuario WHERE id_Usuario=?",[solicitud.body.idIdentificacion],function(error,resBD,filas){
    if(error){
      console.log(error);
    }else{ 
  //terminar la peticion 
             var f=resBD[0].foto;      
        resBD[0].foto=f.toString(); 

      respuesta.json(resBD);   //terminar la peticion 
    }  
  })
});
return router;
}



