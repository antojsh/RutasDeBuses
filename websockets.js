var JsonResponse= {};
require('date-utils');
var usuariosActivos={};
var mongoose = require('mongoose')
var iduser;
var Rutas = require('./rutasbuses')
io.sockets.on('connection', function (socket) {
console.log("Conectado socket")
require('./websockets')(socket,Rutas)
socket.on('app_user',nuevoUsuario)
 socket.on('buscarRuta',buscarRutaPartida);
 socket.on('guardarRuta',addRutaBus);

 });

// module.exports= function(socket,Rutas){
nuevoUsuario= function (data) {
	iduser=data;
	 usuariosActivos[data]=socket.id;
	console.log('Users conectados '+JSON.stringify(usuariosActivos))
}
findAllBusRoute = function(){
		Rutas.find(function(err,rutasbuses){
			if (!err)  socket.emit('findAllBusRoute', OkResponseJSON(200,true,rutasbuses,Date.today()))
			else res.send(errorResponseJSON(500,false,err));
			// res.end(res.status())
			JsonResponse= {};
		})
	}

	//GET
	findById = function(req,res){
		var id_ruta = String(req.params.id)
		console.log(id_ruta)
		Rutas.findById(id_ruta,function(err,rutasbus){
			if (!err) res.send(OkResponseJSON(200,true,rutasbus,Date.today()))
			else res.send('Error en busqueda por Id '+err)
		})
		JsonResponse= {};
	}

	//POST
	addRutaBus= function(data){
		console.log(JSON.stringify(data));
		var ruta = new Rutas(data)
	ruta.save(function(err){
			if(!err) { socket.emit('findAllBusRoute', OkResponseJSON(200,true,data,Date.today()))}
			else socket.emit('findAllBusRoute', errorResponseJSON(500,false,err))
			JsonResponse= {};
		});

	}

	//PUT
	updateRutaBus = function(req,res){
		console.log('+++++++++++++++ '+req.query.name)
		var updatePara= {};
		var conditions = { _id: req.query.id };
		var update = { $set : {name:req.query.name ,description:req.query.description, flota:req.query.flota}};
		var options = { upsert: true };
		Rutas.update(conditions, update, options, function(err,rutasbus){
			if (err) res.send(errorResponseJSON(500,false,err))
			else res.send(OkResponseJSON(200,true,rutasbus,Date.today()))
		});
		JsonResponse= {};

	}

	//DELETE
	deleteRutaBus = function(req,res){
		Rutas.findById(req.params.id,function(err,rutasbus){
			rutasbus.remove(function(err){
			if(!err) res.send(OkResponseJSON(200,true,rutasbus,Date.today()))
			else res.send(errorResponseJSON(500,false,err))

			})
		})
		JsonResponse= {};
	}

	buscarRutaPartida = function(data){

		var distance = 1000 / 6371;
		var query = Rutas.find({'loc': {
		  $near: [data[0][0],data[0][1]],
		  $maxDistance: 0.01,
			}
		});
		query.exec(function (err, ruta) {
		  if (err) {console.log(err);throw err;}
			if (!ruta) {
		    console.log('NAda')
		  } else {
		    console.log('******************** PARTIDA' + ruta);
				buscarRutaDestino(data,ruta)
		  //	socket.emit('rutaEncontrada', OkResponseJSON(200,true,ruta,Date.today()))
		 }
			});
	}
	buscarRutaDestino = function(data,partida){
		var distance = 1000 / 6371;
		var query = Rutas.find({'loc': {
		  $near: [data[1][0],data[1][1]],
		  $maxDistance: 0.01,
			}
		});
		query.exec(function (err, ruta) {
		  if (err) {console.log(err);throw err;}
			if (!ruta) {
		    console.log('NAda')
		  } else {
		    console.log('******************** DESTINO' + ruta);
		  	//socket.emit('rutaEncontrada', OkResponseJSON(200,true,{ruta,partida},Date.today()))
				compararRutas(partida,ruta);
		 }
	 	});
	}
	var a,b;
	function compararRutas(partida,destino){
    var encontro = false;
    var rutasEncontradas={};
		for (var i = 0; i < partida.length; i++) {
				for (var j = 0; j < destino.length; j++) {
					a=partida[i].name;
					b=destino[j].name;

						if(a == b){
							console.log('+++++++++++++++++++++++++++++++++++++')
              rutasEncontradas.push({partida[i]})
													// i=partida.length;
              // econtro=true;
							// break;
						}
				}
		}
    io.sockets.socket(iduser).emit('rutaEncontrada', OkResponseJSON(200,true,rutasEncontradas,Date.today()))

    // if(encontro){
    //   console.log('No Encontro')
    //   	io.sockets.socket(iduser).emit('rutaNoEncontrada', OkResponseJSON(200,true,"",Date.today()))
    // }
	}
	function OkResponseJSON(status,code,data,date){
		JsonResponse={
			status:status,
			code:code,
			date:date,
			data:{
				data
			}
		}
		return JsonResponse;
	}
	function errorResponseJSON(status, code,err){
		JsonResponse.push({
			status:status,
			code:code,
			err:err

		})
		return JsonResponse;
	}
	socket.on('disconnect',function(){
		delete usuariosActivos[iduser]
		console.log('User disconnect '+JSON.stringify(usuariosActivos))
	})
// }
