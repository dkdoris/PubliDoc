 //Framewook
var express = require('express'),
path=require("path"),
nodemailer=require("nodemailer");
//Entorno de Desarrollo
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mysql=require('mysql');//(importar)para acceder a la libreria de mysql desde node
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
//llamando a al archivo
var usuario = require('./routes/usuario');
var anuncio = require('./routes/anuncio');
var mensaje = require('./routes/mensaje');
var publicacion = require('./routes/publicacion');
var admin = require('./routes/admin');



/* */
var request = require('request'); 
//var API_KEY = "AAAAMN0SfGs:APA91bFJ25Cq6UNp2xvMlrkJXweaOBDijKS4JLm1KgvV3uOTYVlSIuYYJiTg5IjEzoip_yAl6qAaO9KsiuRoSsr9bI9ZygCUvlIOIidlY5LdQUVbVQjoX0wQVHs3_gImdOQLu15BBO6M"; // Your Firebase Cloud Server API key
//node_modules contiene todas las librerias que estubieron en el package.json
var app = express(); //Instancia expres para utilizar sus metodos
var conecccion =mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'doris',
    database:'publicacion'
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


app.io= require("socket.io")();
//query consulta a la base de datos
//var mostraUsuario=conecccion.query('SELECT *FROM Usuario',function(error,columnas,filas){



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: '123456', resave: true, saveUninitialized: true}));
//ruteo es el cambio de URL
app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin(conecccion,request));
app.use('/usuario', usuario(conecccion));
app.use('/publicacion', publicacion(conecccion));
app.use('/mensaje', mensaje(app.io,conecccion,request));
app.use('/anuncio', anuncio(conecccion));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



  
module.exports = app;
