
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
var passport = require('passport');
require('./models/usuarios');
require('./passport')(passport);
var session = require('express-session')
var inforPerfil;
var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '104.131.226.138';
//var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || 'localhost';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';
var iduser;
var usuariosActivos={};
var Rutas = require('./models/rutasbuses')
var User = mongoose.model('Usuarios');
server.listen(port,ip_addr);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer({dest:'./uploads'}).single('imagen'))
cloudinary.config({
	cloud_name:"daawlfg2i",
	api_key:"697739221818451",
	api_secret:"vsGFakqDWdHBQSAhs7axRC-iIOg"

})
//mongoose.connect('mongodb://antojsh:antonio199308JSH@ds041663.mongolab.com:41663/busroute',function(err,res){
mongoose.connect('mongodb://127.0.0.1:27017/DbRutasBuses',function(err,res){
	if (err) console.log('Error: '+err)
	else console.log('Conectado Mongo de Digital');
});
app.get('/create', function (req, res) {
  res.sendFile(__dirname + '/google.html');
});
app.get('/material', function (req, res) {
  res.sendFile(__dirname + '/public/Material/index.html');
});
app.get('/lungo', function (req, res) {
  res.sendFile(__dirname + '/public/lungo/index.html');
});
app.use('/static', express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/camera/index.html');
});
app.get('/app', function (req, res) {
  res.sendFile(__dirname + '/public/lungo/index.html');
});
// Configuración de Passport. Lo inicializamos
// y le indicamos que Passport maneje la Sesión

app.use(session({secret: 'antonio199308JSH',
                 saveUninitialized: true,
                 resave: true}));
app.use(passport.initialize());


app.get('/logout', function(req, res) {
  req.session.destroy();
	req.logout();
  res.redirect('/');
	//inforPerfil=null;
});
app.get("/auth/facebook", passport.authenticate('facebook'))

// Ruta para autenticarse con Twitter (enlace de login)
app.get('/auth/twitter', function(req, res, next) {
  console.log(req.query.llave)
  next();
}, passport.authenticate('twitter'));
// Ruta para autenticarse con Facebook (enlace de login)
//app.get('/auth/facebook', passport.authenticate('facebook'));
// Ruta de callback, a la que redirigirá tras autenticarse con Twitter.
// En caso de fallo redirige a otra vista '/login'
app.get('/auth/twitter/callback', passport.authorize('twitter',
  { successRedirect: '/app', failureRedirect: '/' }
),  function(req, res) {
	inforPerfil=req.account;

	res.redirect('/app');
});
// Ruta de callback, a la que redirigirá tras autenticarse con Facebook.
// En caso de fallo redirige a otra vista '/login'
app.get('/auth/facebook/callback', passport.authorize('facebook',
  { successRedirect: '/app', failureRedirect: '/' }
),  function(req, res) {
	inforPerfil=req.account;
	res.redirect('/app');
});
app.post('/saveRuta',function(req,res){
	console.log(JSON.stringify(req.file.path))
	cloudinary.uploader.upload(req.file.path,function(result){
		var ruta = new Rutas()
		ruta.name=req.body.nombreRuta;
		ruta.description= req.body.descripcion;
		ruta.flota= req.body.flota;
		ruta.image=result.url;
		ruta.loc= JSON.parse(req.body.coordenadas);
		ruta.save(function(err){
			if(err) {
			console.log('Error al guardar '+err);
			res.send('<h1>No se pudo Guardar la ruta</h1><br><a href="http://busroute-pruebanodejs.rhcloud.com/">Regresar</a>')
			}
			else {
				console.log('Guardada');
				res.send('<h1>Ruta Guardada</h1><br><a href="http://busroute-pruebanodejs.rhcloud.com/">Guardar Otras Rutas</a>')
			}
		})
	},{ width: 300, height: 350, crop: 'fit' })
})

io.sockets.on('connection', function (socket) {

	socket.emit('userProfile',inforPerfil)
	inforPerfil=null;
	 socket.on('app_user',nuevoUsuario)
 	 socket.on('buscarRuta',buscarRutaPartida);
	 socket.on('guardarRuta',addRutaBus);
	 socket.on('buscarRutaUnica',buscarRutaUnica);
	 socket.on('buscarTodaslasRutas',findAllBusRoute)
	 function nuevoUsuario (data) {

	 	usuariosActivos[data.username]=socket.nickname;
	 	console.log('Users conectados '+JSON.stringify(data))

	 }
	 function findAllBusRoute  (){
	 		Rutas.find({ $query: {}, $orderby: { name : 1 } },'name description image flota city',function(err,rutasbuses){
	 			if (!err)  socket.emit('todaslasrutas', rutasbuses)
	 			else console.log('Error')
	 		})
	 	}

	 	//GET
	 	function buscarRutaUnica (data){

	 		Rutas.findById(data.id,function(err,rutasbus){
	 			if (!err) socket.emit('rutaUnicaEncontrada', {opc:data.opc,ruta:rutasbus})
	 			else console.log(err)
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
			console.log('ENTROOOOOO '+JSON.stringify(data));
	 		var distance = 1000 / 6371;
	 		var query = Rutas.find({'loc': {
	 		  $near: [data[0][0],data[0][1]],
	 		  $maxDistance: 0.006,
			}
		},'name description image');
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
	 		function	buscarRutaDestino (data,partida){
	 		var distance = 1000 / 6371;
	 		var query = Rutas.find({'loc': {
	 		  $near: [data[1][0],data[1][1]],
	 		  $maxDistance: 0.006,
	 			}
	 		},'name description image');
	 		query.exec(function (err, ruta) {
	 		  if (err) {console.log(err);throw err;}
	 			if (!ruta) {
	 		    console.log('NAda');
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
	 						rutasEncontradas.push(partida[i]);
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
	 	socket.on('disconnect',function(socket){
	 		delete usuariosActivos[socket.nickname]
	 		console.log('User disconnect '+JSON.stringify(usuariosActivos))
	 	})


});
