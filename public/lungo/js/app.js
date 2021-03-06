Lungo.init({
    name: 'prueba'
});
var socket = io.connect('http://208.68.38.12:3000',{'forceNew':true });
var fingerprint = new Fingerprint().get();
var coorPartida= new Array();
var coorDestino= new Array();
var tempDir;
var flightPath;
var markers = [];
var markerPerson;
var centerPosition ;
var latlng, markerPartida, markerDestino, markerTemporal;
 var lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 3,
    strokeColor: '#393'
  };
var geocoder = new google.maps.Geocoder;
var infowindow = new google.maps.InfoWindow;
var map;
var mapOptions = {
   center: new google.maps.LatLng(10.942071365517807,-74.78217601776123),
   zoom: 16,
   mapTypeId: google.maps.MapTypeId.ROADMAP
};
socket.on('todaslasrutas',todaslasrutas)
socket.on('rutaEncontrada', rutaEncontrada)
socket.on('rutaUnicaEncontrada',rutaUnicaEncontrada)
socket.on('userProfile',function(data){
//  console.log("Entrando :::"+JSON.stringify(data))
try{

  if(!data ) {

    if(localStorage.getItem('profile')!=null){
       $('#NomUsuario').html(localStorage.getItem('usuario'))
        $('#imgUsuario').attr("src",localStorage.getItem('foto'));
    }else{
      window.location='http://104.131.226.138:8080'
    }
  }else{
    localStorage.setItem("profile", data._id);
    localStorage.setItem("usuario", data.name);
    localStorage.setItem("foto", data.photo);
    $('#NomUsuario').html(data.name)
    $('#imgUsuario').attr("src",data.photo);
  }

}catch(err){
  console.log(err)

   window.location ='http://104.131.226.138:8080';
}
})
 window.addEventListener('load',function(){




  var input = /** @type {HTMLInputElement} */(
      document.getElementById('txt-signup-name'));


  var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));

  // [START region_getplaces]
  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }

    // For each place, get the icon, place name, and location.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  });
  socket.emit('buscarTodaslasRutas',{})
   map = new google.maps.Map(document.getElementById("map"),mapOptions);
    var options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(showPosition,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
    navigator.geolocation.watchPosition(showPositionMove, errorPosition, options);
   google.maps.event.addListener(map, "click", function(e) {
  	$('.dots').fadeIn('fast');
    latlng = e.latLng;
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          markerTemporal = new google.maps.Marker({
            position: latlng,
            map: map
          });
          console.log(JSON.stringify(results));
          // infowindow.setContent(results[1].formatted_address);
          // infowindow.open(map, marker);
          $('#parrafoDir').html(results[1].formatted_address)
          tempDir=results[1].formatted_address;
          $('#articlePopup').css('bottom','0')
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
    $('.dots').fadeOut('fast');
  }) 
 }) 
 
  

  $('#btnPartida').click(function() {
    //alert($(this).hasClass('btnParodesSelec'));z
    if($(this).hasClass('btnParodesSelec')){
      $(this).removeClass('btnParodesSelec');
      $('#btnPartida span').css('color','white');
      markerPartida.setMap(null);

    }else{

      $(this).addClass('btnParodesSelec');
      $('#btnPartida span').css('color','green');
      $('#dirPartida').html('<span class="icon pushpin"></span> '+'<small>'+tempDir+'</small>');
      markerTemporal.setMap(null);
      coorPartida[0]=latlng.lat();
      coorPartida[1]=latlng.lng();
       markerPartida = new google.maps.Marker({
          position: latlng,
          map: map,
          animation: google.maps.Animation.DROP,
          title: 'Partida',
          icon:'static/img/partidaBandera.png',
         
        });

    }
    if($('#btnDestino').hasClass('btnParodesSelec') && $('#btnPartida').hasClass('btnParodesSelec')){
      ocultarFooter()
    }
  })
  $('#btnDestino').click(function() {
    //alert($(this).hasClass('btnParodesSelec'));
    if($(this).hasClass('btnParodesSelec')){
      $(this).removeClass('btnParodesSelec');
      $('#btnDestino span').css('color','white');
      markerDestino.setMap(null);

    }else{

      $(this).addClass('btnParodesSelec');
      $('#btnDestino span').css('color','red');
      $('#dirDestino').html('<span class="icon pushpin"></span> '+'<small>'+tempDir+'</small>');
      markerTemporal.setMap(null);
      coorDestino[0]=latlng.lat();
      coorDestino[1]=latlng.lng();//Quede por aqui error HP
       markerDestino = new google.maps.Marker({
          position: latlng,
          map: map,
          title: 'Destino',
          animation: google.maps.Animation.DROP,
          icon:'static/img/destinoBandera.png',


        });
    if($('#btnDestino').hasClass('btnParodesSelec') && $('#btnPartida').hasClass('btnParodesSelec')){
      ocultarFooter()
    }
  }
  })
  $('#btnCerrarPopup').click(function(e){
	  $('#articlePopup').css('bottom','-150px')
	});

$('#listatodaslasrutas').on('click','li',function(){
  $('.dots').fadeIn('fast');
  socket.emit('buscarRutaUnica',{opc:0,id:this.id})

})
$('#btnBuscarRuta').click(function(){
  $('.dots').fadeIn('fast');
  var array = new Array();
    array[0]=coorPartida
    array[1]=coorDestino
     socket.emit('buscarRuta', array);
})
$('#listarutasEncontradas').on('click','>li',function(){

  $('.dots').fadeIn('fast');
  socket.emit('buscarRutaUnica',{opc:0,id:this.id})
})
$('#listatodaslasrutas').on('click','li',function(){
  $('.dots').fadeIn('fast');
  socket.emit('buscarRutaUnica',{opc:0,id:this.id})

})
// functions
function showPosition(position){

  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var accuracy = position.coords.accuracy;

  centerPosition = new google.maps.LatLng(latitude, longitude);

markerPerson = new google.maps.Marker({
   position: centerPosition,
   map: map,
   icon:'static/img/persona2.png',
    animation: google.maps.Animation.DROP,

});

map.setCenter(centerPosition);
map.setZoom(14)
}
function showPositionMove(position){
  markerPerson.setPosition(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
}
function errorPosition(){

}
function todaslasrutas(data){

  for (var i = 0; i < data.length; i++) {

    $('#listatodaslasrutas').append(  '<li class="thumb big" id='+data[i]._id+'>'+
      '    <img src="'+data[i].image+'">'+
      '    <div>'+
    //  '        <div class="on-right text tiny">'+data[i].city+'</div>'+
      '        <strong>'+data[i].name+'</strong>'+
      '        <span class="text tiny opacity">'+data[i].flota+'</span>'+
      '        <small>'+
      '           '+data[i].description+''+
      '        </small>'+
      '    </div>'+
      '</li>')

  }
}
function mostrarrutaDesdeInfo(data){
  socket.emit('buscarRutaUnica',{opc:1,id:data})
   
}
function rutaUnicaEncontrada(data){
if(data.opc==0){

  $('#rutaEscogida article .empty').html('<img src="'+data.ruta.image+'">'+

'  <ul >'+
'    <li class="accept">'+
'      <strong>'+data.ruta.name+'</strong>'+
'    </li>'+
'    <li class="cancel">'+
'      <strong>'+data.ruta.flota+'</strong>'+
'    </li>'+
'  <li class="warning"><strong>Barrios por donde pasa</strong>'+
'  '+data.ruta.description+''+
'</li>'+
  '</ul>'+
  '<button id="'+data.ruta._id+'" class="anchor margin-bottom" data-label="Ver en Mapa" onclick="mostrarrutaDesdeInfo(id)">Ver en Mapa</button>')

  $('#rutaEscogida header .title').html(data.ruta.name)

  Lungo.Router.section("rutaEscogida");
}
else{
  try{
    flightPath.setMap(null);
  }catch(err){

  }
	var flightPlanCoordinates = [];
	for (var i = data.ruta.loc.length - 1; i >= 0; i--) {
		flightPlanCoordinates.push({lat:data.ruta.loc[i][0], lng:data.ruta.loc[i][1]})
	};
   
   flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 4,
     icons: [{
      icon: lineSymbol,
      offset: '100%'
    }],
  });

  flightPath.setMap(map);
 
  animateCircle(flightPath);
   map.setZoom(13)
}
Lungo.Router.article("main", "home");
   $('.dots').fadeOut('fast');
   $('#divBuscar').css('display','block')
   $('#btnBuscarRuta').css('display','block')
}
function animateCircle(line) {
    var count = 0;
    window.setInterval(function() {
      count = (count + 1) % 200;

      var icons = line.get('icons');
      icons[0].offset = (count / 2) + '%';
      line.set('icons', icons);
  }, 150);
}
function rutaEncontrada(data){
$('#listarutasEncontradas').html('');
  ocultarFooter()
  if(data.length>0){

  $('#numRutasEncontradas').html(data.length)
  $("#btnBuscarRuta").fadeOut("fast");

  
  for (var i = 0; i < data.length; i++) {

    $('#listarutasEncontradas').append(  '<li class="thumb big" id='+data[i]._id+'>'+
      '    <img src="'+data[i].image+'">'+
      '    <div>'+
      '        <div class="on-right text tiny">'+data[i].city+'</div>'+
      '        <strong>'+data[i].name+'</strong>'+
      '        <span class="text tiny opacity">'+data[i].flota+'</span>'+
      '        <small>'+
      '           '+data[i].description+''+
      '        </small>'+
      '    </div>'+
      '</li>')

  }

  Lungo.Router.article("main", "todasRutas");
  $("#ups_x_rutas_encontrada").fadeOut("fast");
  $("#divBuscar").fadeOut("fast");
  $('#listDirecciones').css('display','block')

}else{
  Lungo.Notification.error(
    "Ups !",                      //Title
    "No se encontro ninguna ruta cercana",     //Description
    "cancel",                     //Icon
     3
    );
}
    $('.dots').fadeOut('fast');
}
function ocultarFooter(){
  $('#articlePopup').css('bottom','-150px');
}
$('#LimpiarMap').click(function(){
  LimpiarMapa();
})
$('#PosicionActual').click(function(){
  map.setCenter(centerPosition);
})
function LimpiarMapa(){
 
  try {
     flightPath.setMap(null);
    markerPartida.setMap(null);
    markerDestino.setMap(null);
  }
  catch(err) {
      flightPath.setMap(null);
      markerDestino.setMap(null);
     markerPartida.setMap(null);
  } 
  finally {
     $('#btnDestino').removeClass('btnParodesSelec');
  $('#btnPartida').removeClass('btnParodesSelec');
  $('#btnDestino span').css('color','white');
  $('#btnPartida span').css('color','white');

   coorPartida = new Array();
   coorDestino = new Array();
      flightPath.setMap(null);
    markerPartida.setMap(null);
    markerDestino.setMap(null);
  }
  
}
