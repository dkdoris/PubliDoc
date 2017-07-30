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
        alert($scope.varIniciarSession.usuario);
        $http.post('/admin/iniciarSesion', $scope.varIniciarSession)
            .then(function(data) {
                alert(data);
                if(data!=1){              
                    $state.go("principal");                
                }               
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    };
})
.controller('principalController',function($scope, $http,$state){
    alert("principal");
})
.controller('gestion_usuariosController',function($scope, $http,$state){

     $http.get('/admin/listaUsuarios')
            .then(function(data) {                
              alert(data);
              $scope.listaUsuarios=data;
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
})
.controller('denuncias_usuariosController',function($scope, $http,$state){
    $http.get('/admin/listaUsuariosDenunciados')
            .then(function(data) {                
              alert(data);
              $scope.listaUsuariosDenunciados=data;
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
})
.controller('denuncias_publicacionesController',function($scope, $http,$state){
    $http.get('/admin/listaPublicacionesDenunciadas')
            .then(function(data) {                
              alert(data);
              $scope.listaPublicacionesDenunciadas=data;
            })
            .catch(function(data) {                
                console.log('Error:' + data);
            });
    
})
