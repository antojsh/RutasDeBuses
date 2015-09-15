
var repeat = require('repeat-array');
require('date-utils');
var mongoose = require('mongoose')
var bodyParser= require('body-parser')
var multer = require('multer');
var cloudinary = require('cloudinary');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';
var iduser;
var usuariosActivos={};
server.listen(port,ip_addr);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer({dest:'./uploads'}).single('imagen'))
cloudinary.config({
	cloud_name:"daawlfg2i",
	api_key:"697739221818451",
	api_secret:"vsGFakqDWdHBQSAhs7axRC-iIOg"

})
// var connection_string = '127.0.0.1:27017/busroute';
// // if OPENSHIFT env variables are present, use the available connection info:
// if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
//   connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
//   process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
//   process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
//   process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
//   process.env.OPENSHIFT_APP_NAME;
// }
mongoose.connect('mongodb://antojsh:antonio199308JSH@ds041663.mongolab.com:41663/busroute',function(err,res){
//	mongoose.connect('mongodb://localhost:27017/DbRutasBuses',function(err,res){

	if (err) console.log('Error: '+err)
	else console.log('Conectado Mongo');
});
app.use('/static', express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/app', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.post('/saveRuta',function(req,res){
	console.log(JSON.stringify(req.file.path))
	cloudinary.uploader.upload(req.file.path,function(result){
		var ruta = new Rutas()
		ruta.name=req.body.nombreRuta;
		ruta.description= req.body.descripcion;
		ruta.flota= req.body.flota;
		ruta.image=result.url;
		ruta.loc= req.body.coordenadas;
		ruta.save(function(err){
			if(err) {
			console.log('Error al guardar');
			res.send('<h1>No se puedo Guardar la ruta</h1><br><a href="http://busroute-pruebanodejs.rhcloud.com/">Regresar</a>')
			}
			else {
				console.log('Guardada');
				res.send('<h1>Ruta Guardara</h1><br><a href="http://busroute-pruebanodejs.rhcloud.com/">Guardar Otras Rutas</a>')
			}
		})
	})
})
var Rutas = require('./rutasbuses')
io.sockets.on('connection', function (socket) {
	 socket.on('app_user',nuevoUsuario)
 	 socket.on('buscarRuta',buscarRutaPartida);
	 socket.on('guardarRuta',addRutaBus);
	 socket.on('buscarRutaUnica',buscarRutaUnica);
	 function nuevoUsuario (data) {
	 	iduser=data;
	 	usuariosActivos[data]=socket.id;
	 	//console.log('Users conectados '+JSON.stringify(usuariosActivos))
	 }
	 function findAllBusRoute  (){
	 		Rutas.find(function(err,rutasbuses){
	 			if (!err)  socket.emit('findAllBusRoute', rutasbuses)
	 			//else res.send(errorResponseJSON(500,false,err));
	 			// res.end(res.status())
	 			JsonResponse= {};
	 		})
	 	}

	 	//GET
	 	function buscarRutaUnica (data){

	 		Rutas.findById(data,function(err,rutasbus){
	 			if (!err) socket.emit('rutaUnicaEncontrada', rutasbus)
	 			else res.send('Error en busqueda por Id '+err)
	 		})
	 		JsonResponse= {};
	 	}

	 	//POST
	 	function addRutaBus(data){
	 		console.log(JSON.stringify(data));
	 		var ruta = new Rutas(data)
	 	ruta.save(function(err){
	 			if(!err) { socket.emit('findAllBusRoute', data)}
	 			else socket.emit('findAllBusRoute', err)

	 		});

	 	}

	 	//PUT
	 // 		function updateRutaBus (req,res){
	 // 		console.log('+++++++++++++++ '+req.query.name)
	 // 		var updatePara= {};
	 // 		var conditions = { _id: req.query.id };
	 // 		var update = { $set : {name:req.query.name ,description:req.query.description, flota:req.query.flota}};
	 // 		var options = { upsert: true };
	 // 		Rutas.update(conditions, update, options, function(err,rutasbus){
	 // 			if (err) res.send(errorResponseJSON(500,false,err))
	 // 			else res.send(OkResponseJSON(200,true,rutasbus,Date.today()))
	 // 		});
	 //
		//
		// 	}

	 	//DELETE
		// 	function deleteRutaBus (req,res){
	 // 		Rutas.findById(req.params.id,function(err,rutasbus){
	 // 			rutasbus.remove(function(err){
	 // 			if(!err) res.send(OkResponseJSON(200,true,rutasbus,Date.today()))
	 // 			else res.send(errorResponseJSON(500,false,err))
		//
	 // 			})
	 // 		})
	 // 		JsonResponse= {};
		// 	}

	 	 function buscarRutaPartida(data){

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
	 		    //console.log('******************** PARTIDA' + ruta);
	 				buscarRutaDestino(data,ruta)
	 		  //	socket.emit('rutaEncontrada', OkResponseJSON(200,true,ruta,Date.today()))
	 		 }
	 			});
	 	}
	 		function	buscarRutaDestino (data,partida){
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
	 		    //console.log('******************** DESTINO' + ruta);
	 		  	//socket.emit('rutaEncontrada', OkResponseJSON(200,true,{ruta,partida},Date.today()))
	 				compararRutas(partida,ruta);
	 		 }
	 	 	});
	 	}
	 	var a,b;
	 	function compararRutas(partida,destino){
			var rutasEncontradas=new Array();
	 		for (var i = 0; i < partida.length; i++) {
	 				for (var j = 0; j < destino.length; j++) {
	 					a=partida[i].name;
	 					b=destino[j].name;
						if(a == b){
							//console.log(partida[i].name+'  '+destino[j].name)
	 						rutasEncontradas.push(partida[i])
	 					}
	 				}
	 		}
      // var norepetidas = JSON.stringify(rutasEncontradas)
      // for(var i =0;i<norepetidas.length-1;i++){
      //
      //     for(var j=i+1;j<norepetidas.length;j++){
      //            if(norepetidas[i].name ==norepetidas[j].name){
      //               norepetidas.splice(j,1);
      //               j--;
      //            }
      //       }
      // }

			socket.emit('rutaEncontrada',rutasEncontradas)
		}
		// 	function OkResponseJSON(status,code,data,date){
	 // 		JsonResponse={
	 // 			status:status,
	 // 			code:code,
	 // 			date:date,
	 // 			data:{
	 // 				data
	 // 			}
	 // 		}
	 // 		return JsonResponse;
		// 	}
		// 	function errorResponseJSON(status, code,err){
	 // 		JsonResponse.push({
	 // 			status:status,
	 // 			code:code,
	 // 			err:err
		//
	 // 		})
	 // 		return JsonResponse;
		// 	}
	 	socket.on('disconnect',function(){
	 		delete usuariosActivos[iduser]
	 		console.log('User disconnect '+JSON.stringify(usuariosActivos))
	 	})


});
