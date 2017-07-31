$(document).ready(function () {		
	$('[name=btn_ActDes]').on('click',function(e){		
		var id=e.target.id;		        		
		$.ajax({
			url:'/admin/estado_usuario',			
			method: "PUT",
			data:{id:id}
		})
		.done(function(doc){
			alert(doc);
			location.reload();		
		});
        
	});



/*Metodo de Restaurar Contrasena de Usuario*/
$('[name=btn_restaurar_contrasena]').on('click',function(e){    
        var id=e.target.id;			     
		$.ajax({
			url:'/admin/restaurar_contrasena',			
			method: "PUT",
			data:{id:id}
		})
		.done(function(doc){
			alert(doc);	
		});        
	});

	
/*Metodo Eliminar un Usuario*/
$('[name=btn_eliminar_usuario]').on('click',function(e){    
        var id=e.target.id;	      
		$.ajax({
			url:'/admin/eliminar_usuario',			
			method: "DELETE",
			data:{id:id}
		})
		.done(function(doc){
			alert(doc);			
			location.reload();
		});        
	});

});