var btnMenu 	  = document.querySelector('#btnMenu')
var aside 		  = document.querySelector('aside')
var btnCerrarMenu = document.querySelector('#btnCerrarMenu')
btnMenu.addEventListener('click',function(e){
	e.preventDefault()
	aside.classList.toggle('mostrarMenu');
})
btnCerrarMenu.addEventListener('click',function(e){
	e.preventDefault()
	aside.classList.toggle('mostrarMenu');
})