var JsonResponse= {};
require('date-utils');

var mongoose = require('mongoose')
module.exports= function(){
	
	var rutasSchema ={
		name:String,
		description:String,
		flota:String
	}
	var Rutas = mongoose.model("RutasBuses",rutasSchema)

	// GET
	
	//ROUTES
	
	// app.get('/findbyId/:id',findById);
	// app.post('/new',addRutaBus);
	// app.put('/update/:id',updateRutaBus);
	// app.delete('/delete/:id',deleteRutaBus)
}