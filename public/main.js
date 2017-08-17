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
app.controller( 'loginController', function($scope, $http,$state,datosUser) {      
    $scope.varIniciarSession={
        usuario:"",
        contrasena:""
    }
    $scope.iniciarSession = function(){
        $http.post('/admin/iniciarSesion', $scope.varIniciarSession)
            .then(function(data) {
                if(data!=1){   
                    datosUser.user=data['data'][0];
                    $state.go("principal.gestion_usuarios");                
                }               
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    };
});
app.controller( 'gestion_publicaionController', function($scope, $http,$state) {      
    $scope.mensajeP="";
    $scope.listarPublicaciones=function(){
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
    $scope.publicar=function(id_Publicacion,variable){
        var razon="";
        if(variable==2){
            razon = prompt("¿Escriba la razon de porque esta publicación va a ser negada?", "");
            if (razon != null){
                $http.put('/admin/actualizarPublicacion',{variable,id_Publicacion,razon})
                .then(function(data) {              
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
            $http.put('/admin/actualizarPublicacion',{variable,id_Publicacion,razon})
                .then(function(data) {              
                    $scope.mensajeP="La publicación fue aceptada";                        
                    $scope.listarPublicaciones();
                })
                .catch(function(data) {                
                    console.log('Error:' + data);
            });  
        }
    }   
    
})
.controller('principalController',function($scope, $http,$state,datosUser){
    $scope.cerrarSesion=function(){
       //alert("Entre");
  //      window.history.forward();
         //   var nombre=datosUser.user['nombres'];
           // var id=datosUser.user['id_Usuario'];
            var datos=datosUser.user;
             $http.post('/admin/cerrar_session',{datos})
            .then(function(data) {            
                $state.go("login");
                
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    }
    
    $scope.verPerfil=function(){

        $scope.datosPerfil=datosUser.user;
    };
})
.controller('gestion_usuariosController',function($scope, $http,$state){  
    $scope.mensaje="";
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

    $scope.desactivar=function(id){
        $http.put('/admin/estado_usuario',{id})
            .then(function(data) {  
                $scope.listarUser(); 
                if(data['data']==0){
                    $scope.mensaje="Usuario activo";
                }else{
                    $scope.mensaje="Usuario inactivo";
                }                
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
                $scope.mensaje="Se restablecio la constarsena";
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });                
    }            
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
