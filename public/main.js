var app = angular.module("myApp", ["ui.router"]);

app.config(function($stateProvider, $urlRouterProvider) {    
    $urlRouterProvider.otherwise('/login');
    $stateProvider        
        .state('login', {
            url: '/login',
            templateUrl : "view/login.html",
            controller:"loginController"
        })        
        .state('principal', {
            url: '/principal',
            templateUrl : "view/principal.html",
            controller:"principalController"
        })        
        .state('principal.gestion_usuarios', {
            url: '/gestion de usuarios',
            templateUrl : "view/gestion_usuarios.html",
            controller:"gestion_usuariosController"
        })
          .state('principal.denuncias_usuarios', {
            url: '/gestion de usuarios',
            templateUrl : "view/denuncias_usuarios.html",
            controller:"denuncias_usuariosController"
        })
        .state('principal.denuncias_publicaciones', {
            url: '/gestion de usuarios',
            templateUrl : "view/denuncias_publicaciones.html",
            controller:"denuncias_publicacionesController"
        }) 
});

app.controller( 'loginController', function($scope, $http,$state) {      
    $scope.varIniciarSession={
        usuario:"",
        contrasena:""
    }
    $scope.iniciarSession = function(){
        $http.post('/admin/iniciarSesion', $scope.varIniciarSession)
            .then(function(data) {
                if(data!=1){              
                    $state.go("principal.gestion_usuarios");                
                }               
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    };
})
.controller('principalController',function($scope, $http,$state){
})
.controller('gestion_usuariosController',function($scope, $http,$state){  
    $scope.mensaje="";
    $scope.listarUser=function(){
     $http.get('/admin/listaUsuarios')
            .then(function(data) {            
              $scope.listaUsuarios=data['data'];
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
<<<<<<< HEAD
    var id_D;
=======
>>>>>>> origin/master
    $scope.cargarDenuncias=function(){
        $http.get('/admin/listaUsuariosDenunciados')
                .then(function(data) {                
                $scope.listaUsuariosDenunciados=data['data'];
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
<<<<<<< HEAD
    $scope.mostrarPerfil=function(id_Usuario,denunciaUsuario,id_Denuncia){
        id_D=id_Denuncia;
=======
    $scope.mostrarPerfil=function(id_Usuario,denunciaUsuario){
>>>>>>> origin/master
        $scope.denuncia=denunciaUsuario;
        $http.post('/admin/mostrar_perfil',{id_Usuario})
            .then(function(data) {                
                $scope.datosUsuario=data['data'][0];
<<<<<<< HEAD
=======
                console.log(data);
                alert($scope.datosUsuario.cedula);
>>>>>>> origin/master
            })
            .catch(function(data) {                
                    console.log('Error:' + data);
                });
<<<<<<< HEAD
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
=======
    };                                      
>>>>>>> origin/master
})
.controller('denuncias_publicacionesController',function($scope, $http,$state){
    $scope.cargarDenunciasPublicaciones=function(){
        $http.get('/admin/listaPublicacionesDenunciadas')
                .then(function(data) {                
                $scope.listaPublicacionesDenunciadas=data['data'];
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
    
})
