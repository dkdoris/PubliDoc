var app = angular.module("myApp", ["ui.router","datatables"]);

app.config(function($stateProvider, $urlRouterProvider) {    
    $urlRouterProvider.otherwise('/login');
    $stateProvider        
        .state('login', {
            cache: false,
            url: '/login',
            templateUrl : "view/login.html",
            controller:"loginController"
        })        
        .state('principal', {
            cache: false,
            url: '/principal',
            templateUrl : "view/principal.html",
            controller:"principalController"
        })        
        .state('principal.gestion_usuarios', {
            cache: false,
            url: '/gestion de usuarios',
            templateUrl : "view/gestion_usuarios.html",
            controller:"gestion_usuariosController"
        })
          .state('principal.denuncias_usuarios', {
            cache: false,
            url: '/gestion de usuarios',
            templateUrl : "view/denuncias_usuarios.html",
            controller:"denuncias_usuariosController"
        })
        .state('principal.denuncias_publicaciones', {
            cache: false,
            url: '/gestion de usuarios',
            templateUrl : "view/denuncias_publicaciones.html",
            controller:"denuncias_publicacionesController"
        })
        .state('principal.gestion_publicacion', {
            cache: false,
            url: '/gestion de publicación',
            templateUrl : "view/gestion_publicacion.html",
            controller:"gestion_publicaionController"
        })
});
app.factory("datosUser", function () {
    var _user= {};
    return {
        user: _user
    };
})
app.factory("validarCed", function () {
    return {
        validarCedul: function (id_ced) {
            var cedula = id_ced;
            // Extraigo el ultimo digito
            var ultimo_digito = cedula.substring(9, 10);
            //Agrupo todos los pares y los sumo
            var pares = parseInt(cedula.substring(1, 2)) + parseInt(cedula.substring(3, 4)) + parseInt(cedula.substring(5, 6)) + parseInt(cedula.substring(7, 8));
            //Agrupo los impares, los multiplico por un factor de 2, si la resultante es > que 9 le restamos el 9 a la resultante
            var numero1 = cedula.substring(0, 1);
            var numero1 = (numero1 * 2);
            if (numero1 > 9) {
                var numero1 = (numero1 - 9);
            }
            var numero3 = cedula.substring(2, 3);
            var numero3 = (numero3 * 2);
            if (numero3 > 9) {
                var numero3 = (numero3 - 9);
            }
            var numero5 = cedula.substring(4, 5);
            var numero5 = (numero5 * 2);
            if (numero5 > 9) {
                var numero5 = (numero5 - 9);
            }
            var numero7 = cedula.substring(6, 7);
            var numero7 = (numero7 * 2);
            if (numero7 > 9) {
                var numero7 = (numero7 - 9);
            }
            var numero9 = cedula.substring(8, 9);
            var numero9 = (numero9 * 2);
            if (numero9 > 9) {
                var numero9 = (numero9 - 9);
            }
            var impares = numero1 + numero3 + numero5 + numero7 + numero9;
            //Suma total
            var suma_total = (pares + impares);
            //extraemos el primero digito
            var primer_digito_suma = String(suma_total).substring(0, 1);
            //Obtenemos la decena inmediata
            var decena = (parseInt(primer_digito_suma) + 1) * 10;
            //Obtenemos la resta de la decena inmediata - la suma_total esto nos da el digito validador
            var digito_validador = decena - suma_total;
            //Si el digito validador es = a 10 toma el valor de 0
            if (digito_validador == 10)
                var digito_validador = 0;
            //Validamos que el digito validador sea igual al de la cedula
            if (digito_validador == ultimo_digito) {
                return true;
            } else {
                return false;
            }
        }
    }
})
app.controller( 'loginController', function($scope, $http,$state,datosUser) {      
    $scope.varIniciarSession={
        usuario:"",
        contrasena:""
    }
    $scope.iniciarSession = function(){
        //Se presente todo el menu
        $http.post('/admin/iniciarSesion', $scope.varIniciarSession)
            .then(function(data) {
                if(data['data']!=1){   
                    if(data['data']==-1){
                        alert("Los datos estan mal ingresados o la cuenta no existe");

                    }else{
                         datosUser.user=data['data'][0];
                         if (data['data'][0]['borrado_Logico']==1) {
                            alert("La cuenta esta bloqueada");
                         }else{
                            if(data['data'][0]['id_Rol']==1){
                                $state.go("principal.gestion_usuarios");   
                            }else{
                                if(data['data'][0]['id_Rol']==2){
                                    $state.go("principal.gestion_publicacion"); 
                                }
                            }
                         }                         
                    }
 

                }               
            })
            .catch(function(data) {                
                var mensaje = confirm("Ha ocurrido un error intenta :(");
                //Detectamos si el usuario acepto el mensaje
                if (mensaje) {
                    $scope.iniciarSession();
                }
                //Detectamos si el usuario denegó el mensaje
                else {
                  $state.go("login");
                }
            });
    };
});
app.controller( 'gestion_publicaionController', function($scope, $http,$state) {      
    $scope.mensajeP="";
    $scope.listarPublicaciones=function(){
        $scope.mensajeP="";
     $http.get('/admin/listarPublicaciones')
            .then(function(data) {            
                $scope.listaPublicaciones=data['data'];                
                for (var i = 0; i < $scope.listaPublicaciones.length; i++) {
                    var todayTime  = new Date($scope.listaPublicaciones[i]['fecha_Publicacion']);
                    var month = todayTime.getMonth() + 1;
                    var day = todayTime.getDate();
                    var year = todayTime.getFullYear();
                    var fecha=year + "/" + month + "/" + day; 
                    $scope.listaPublicaciones[i]['fecha_Publicacion']=fecha;  
                };
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    }
    $scope.listarPublicaciones();
    $scope.verPublicacion=function(id_PublicacionD){
        $http.post('/admin/mostrarPublicacion',{id_PublicacionD})
                .then(function(data) {              
                    $scope.datosPublicacion=data['data'][0];
                    if(data['data'][0]['fecha_Encuentro']!=null){
                        var todayTime  = new Date(data['data'][0]['fecha_Encuentro']);
                        var month = todayTime.getMonth() + 1;
                        var day = todayTime.getDate();
                        var year = todayTime.getFullYear();
                        var fecha=year + "/" + month + "/" + day;   
                        $scope.datosPublicacion.fecha_Encuentro=fecha;
                    } 
                    if(data['data'][0]['fecha_Perdida']!=null){
                        var todayTime  = new Date(data['data'][0]['fecha_Perdida']);
                        var month = todayTime.getMonth() + 1;
                        var day = todayTime.getDate();
                        var year = todayTime.getFullYear();
                        var fecha=year + "/" + month + "/" + day;   
                        $scope.datosPublicacion.fecha_Perdida=fecha;
                    }                    
                })
                .catch(function(data) {                
                    console.log('Error:' + data);
                });        
    }
    $scope.publicar=function(id_Publicacion,variable,cedula,id_Usuario){
        var razon="";
        if(variable==2){
            razon = prompt("¿Escriba la razon de porque esta publicación va a ser negada?", "");
            if (razon != null){
                $http.put('/admin/actualizarPublicacion',{variable,id_Publicacion,razon})
                .then(function(data) {              
                  //  alert(data['data']);
                    $scope.mensajeP="La publicación fue denegada";                        
                    $scope.listarPublicaciones();
                })
                .catch(function(data) {                
                    console.log('Error:' + data);
                });             
            }else {
                alert("Para realizar esta operación se debe ingresar la razón");
            }   
        }else{
            $http.put('/admin/actualizarPublicacion',{variable,id_Publicacion,razon,cedula,id_Usuario})
                .then(function(data) {                                
                    $scope.mensajeP="La publicación fue aceptada";                        
                 //   alert(data);  
                    $scope.listarPublicaciones();
                })
                .catch(function(data) {                 
                    console.log('Error:' + data);
            });  
        }
    }       
})
.controller('principalController',function($scope, $http,$state,datosUser){
    $scope.verificarSesion=function(){
        $scope.esconderMenu=false;
        if(datosUser.user.id_Rol==2){
            $scope.esconderMenu=true;
        }
             $http.get('/admin/verificarSesion')
            .then(function(data) { 
                if (data['data']=="1") {
                    $state.go("login");
                }                
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    }
    $scope.verificarSesion();

    $scope.cerrarSesion=function(){
           //var datos=datosUser.user;

             $http.post('/admin/cerrar_session')
            .then(function(data) {            
                $state.go("login");
                
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    };
    
    $scope.verPerfil=function(){

        $scope.datosPerfil=datosUser.user;
    };
})
.controller('gestion_usuariosController',function($scope, $http,$state,validarCed){  
    $scope.logContrasena = true;
    $scope.emailValido = true;
    $scope.datosSoap = true;
        //Crea una fecha actual
    $scope.fechaActual = new Date();
    //Calcula la fecha limite a ser presentada
    $scope.fechaPasada = new Date();
    $scope.fechaPasada.setDate($scope.fechaPasada.getDate() - 36500);   
    $scope.usuario={        
        cedula: '',
        nombres: '',
        fecha_Nacimiento: '',
        email: '',
        celular: '',
        link_Facebook: '',
        contrasena: '',
        foto: '',
        tipo:'',
        token:''
    }
    var res;
    $scope.mensaje="";
    $scope.cedulaValida=true;
    $scope.listarUser=function(){
     $http.get('/admin/listaUsuarios')
            .then(function(data) {            
              $scope.listaUsuarios=data['data'];
              $scope.mensaje="";
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    }
    $scope.listarUser();
    $scope.desactivar=function(id,tipo){        
        $http.put('/admin/estado_usuario',{id,tipo})
            .then(function(data) {  
                console.log(data['data']);
                if(data['data']==0){
                    $scope.mensaje="Usuario activo";
                }else{
                    $scope.mensaje="Usuario inactivo";
                } 
                $scope.listarUser();   
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });                    
    }
    $scope.restaurarContrasena=function(id,cedula){
        $http.put('/admin/restaurar_contrasena',{id,cedula})
            .then(function(data) {                            
                //$scope.restaurarC=data['data'];
                //console.log(data);
                $scope.mensaje="Constarseña cambiada";
                $scope.listarUser(); 
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });                
    } 
    $scope.tamanoContrasena = function () {
        if (($scope.usuario.contrasena.length > 4) && ($scope.usuario.contrasena.length < 21)) {
            $scope.logContrasena = true;
        } else {
            $scope.logContrasena = false;
        }
    };
        //Verifica el formato ingresado en el campo del email para ver si esta correcto de lo contrario muestra un mensaje de error
    $scope.validarEmail = function () {
        if ((/(.+)@(.+){2,}\.(.+){2,}/.test($scope.usuario.email)) && ($scope.usuario.email != "")) {
            $scope.emailValido = true;
        } else {
            if ($scope.usuario.email != "") {
                $scope.emailValido = false;
            }
        }
    };
    $scope.obtenerTipoUser=function(){
        $http.get('/admin/obtener_TipoUsuario')
        .then(function(data) {            
            $scope.tipoUser=data['data'];
                
        })
        .catch(function(data) {  

            console.log('Error:' + data['data']);
        });
    }
    $scope.tipoInput = 'password';
    $scope.mostrarEsconderContrasena = function () {
        if ($scope.tipoInput == 'password')
            $scope.tipoInput = 'text';
        else
            $scope.tipoInput = 'password';
    }
    function readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
 
            reader.onload = function (e) {
                /*var filePreview = document.createElement('img');
                filePreview.id = 'file-preview';*/
                //e.target.result contents the base64 data from the image uploaded
                var filePreview = document.getElementById('file-preview');
                filePreview.src = e.target.result;
                var f=e.target.result;
              //  alert(f);
                res = f.split(",");
               // console.log("  despues de la coma  "+ res[1]);
               //$scope.usuario.foto=res[1];
               // var previewZone = document.getElementById('file-preview-zone');
                //previewZone.appendChild(filePreview);
            }
 
            reader.readAsDataURL(input.files[0]);
        }
    }
    var fileUpload = document.getElementById('file-upload');
        fileUpload.onchange = function (e) {
        readFile(e.srcElement);
    }     
    $scope.crearUsuario=function(){
            $scope.usuario.foto=res[1];
             $http.post('/admin/crearUsuario', $scope.usuario)
            .then(function(data) {    
            console.log(data['data']);        
                if (data['data']== 0) {
                    alert('Algunos datos ingresados pertenecen a una cuenta, comunicarse al correo electronico karyto743@gmail.com');
                } else {
                    if (data['data'] == -2) {                    
                        alert('La cuenta ya existe, comunicarse al correo electronico karyto743@gmail.com');
                    } else {   
                        if (data['data'] == -3) {                                  
                            alert('La cuenta esta bloqueda, comunicarse al correo electronico karyto743@gmail.com');
                        } else {
                             alert('SE CREO CORECTAMENTE LA CUENTA');
                             $scope.listarUser();
                        }
                    }
                }
                
            })
            .catch(function(data) {  

                console.log('Error:' + data['data']);
            });
    };
    /*$scope.validarCedula = function () {   
        if($scope.usuario.cedula.length==10){
            if (validarCed.validarCedul($scope.usuario.cedula) == true) {
                $scope.cedulaValida = true;
            } else {
                $scope.cedulaValida = false;
            }                   
        }else{
            $scope.cedulaValida=false;
        } 
    }*/
        $scope.validarCedula = function () {   
        if ($scope.usuario.cedula.length == 10) {
            $scope.usuario.cedula += "";
            if (validarCed.validarCedul($scope.usuario.cedula) == true) {
                $scope.cedulaValida = true;
                $http.get('http://siaaf.unl.edu.ec:8091/api/v1/servicios_web/buscar-por-cedula-reg-civil/'+ $scope.usuario.cedula)                
                .then(function(data) {  
                                    //Guarda los nombres y apellidos del usuario que ingreso el número de cédula para presentarlos a la aplicaicon 
                    if ((data["data"]["data"]["Error"] == "N.U.I. INCORRECTO.") || (data["data"]["data"]["CodigoError"] == "009")) {
                        $scope.datosSoap = false;
                    } else {
                        $scope.datosSoap = true;
                        $scope.nombres = data["data"]["data"]["Nombre"];
                        $scope.edad = data["data"]["data"]["FechaNacimiento"];
                        $scope.usuario.nombres = $scope.nombres;
                        $scope.usuario.fecha_Nacimiento = $scope.edad;
                    }                  
                })
                .catch(function(data) {  
                    console.log('ERROR: ' + data['data']);
                    $scope.nombres = '';
                    $scope.edad = '';
                });
            } else{
                $scope.nombres = '';
                $scope.edad = '';
                $scope.cedulaValida = false;
            }
        } else {
            $scope.nombres = '';
            $scope.edad = '';
            $scope.cedulaValida = false;
        }
    };
})
.controller('denuncias_usuariosController',function($scope, $http,$state){
    $scope.mensajeDU="";
    var id_D;
    $scope.cargarDenuncias=function(){
        $http.get('/admin/listaUsuariosDenunciados')
                .then(function(data) {                
                $scope.listaUsuariosDenunciados=data['data'];
                $scope.mensajeDU="";
                })
                .catch(function(data) {                
                    console.log('Error:' + data);
                });
    };
    $scope.cargarDenuncias(); 
    $scope.omitirDenucia=function(id_Denuncia){
        $http.put('/admin/omitirDenunciaUsuario',{id_Denuncia})
            .then(function(data) {                
                $scope.mensajeDU="La denuncia ha sido omitida";
                //$state.go("principal.denuncias_usuarios");  
                $scope.cargarDenuncias(); 
            })
            .catch(function(data) {                
                    console.log('Error:' + data);
                });
    };
    $scope.mostrarPerfil=function(id_Usuario,denunciaUsuario,id_Denuncia){
        id_D=id_Denuncia;
        $scope.denuncia=denunciaUsuario;
        $http.post('/admin/mostrar_perfil',{id_Usuario})
            .then(function(data) {                
                $scope.datosUsuario=data['data'][0];
            })
            .catch(function(data) {                
                    console.log('Error:' + data);
                });
    };               
    $scope.desactivarUsuario=function(id){
        $http.put('/admin/inactivarDenuncia',{id,id_D})
            .then(function(data) {                
               // $scope.datosUsuario=data['data'][0];
                $scope.mensajeDU="Usuario inactivo";
                $scope.cargarDenuncias(); 
            })
            .catch(function(data) {                
                    console.log('Error:' + data);
                });
    };                                              
})
.controller('denuncias_publicacionesController',function($scope, $http,$state){
    $scope.mensajeDP="";
    var id_D;
    $scope.cargarDenunciasPublicaciones=function(){
        $http.get('/admin/listaPublicacionesDenunciadas')
                .then(function(data) {                
                $scope.listaPublicacionesDenunciadas=data['data'];
                $scope.mensajeDP="";
                })
                .catch(function(data) {                
                    console.log('Error:' + data);
                });
    }
    $scope.cargarDenunciasPublicaciones();
    $scope.omitirDenucia=function(id_Denuncia){
        $http.put('/admin/omitirDenunciaUsuario',{id_Denuncia})
            .then(function(data) {                
                $scope.mensajeDP="La denuncia ha sido omitida";
                //$state.go("principal.denuncias_usuarios");  
                $scope.cargarDenunciasPublicaciones();
            })
            .catch(function(data) {                
                    console.log('Error:' + data);
                });
    }; 
    $scope.verPublicacion=function(descripcionDenuncia,id_PublicacionD,id_Denuncia){
        $scope.denuncia=descripcionDenuncia;
        id_D=id_Denuncia;
        $http.post('/admin/mostrarPublicacion',{id_PublicacionD})
                .then(function(data) {              
                    $scope.datosPublicacion=data['data'][0];
                    if(data['data'][0]['fecha_Encuentro']!=null){
                        var todayTime  = new Date(data['data'][0]['fecha_Encuentro']);
                        var month = todayTime.getMonth() + 1;
                        var day = todayTime.getDate();
                        var year = todayTime.getFullYear();
                        var fecha=year + "/" + month + "/" + day;   
                        $scope.datosPublicacion.fecha_Encuentro=fecha;
                    } 
                    if(data['data'][0]['fecha_Perdida']!=null){
                        var todayTime  = new Date(data['data'][0]['fecha_Perdida']);
                        var month = todayTime.getMonth() + 1;
                        var day = todayTime.getDate();
                        var year = todayTime.getFullYear();
                        var fecha=year + "/" + month + "/" + day;   
                        $scope.datosPublicacion.fecha_Perdida=fecha;
                    }                    
                    //$scope.mensajeDP="La publicación se dio de baja ";
                })
                .catch(function(data) {                
                    console.log('Error:' + data);
                });
    }
    $scope.desactivarPublicacion=function(id_Publicacion){
        var razon = prompt("¿Escriba la razon de porque esta publicación va a ser negada?", "");
            if (razon != null){
                $http.put('/admin/inactivarPublicacion',{id_Publicacion,id_D,razon})
                    .then(function(data) {  
                        $scope.mensajeDP="La publicación se dio de baja ";            
                        $scope.cargarDenunciasPublicaciones();                    
                    })
                    .catch(function(data) {                
                        console.log('Error:' + data);
                    });            
            }else {
                alert("Para realizar esta operación se debe ingresar la razón");
            }

    }    
    
});