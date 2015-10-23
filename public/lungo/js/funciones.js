Lungo.init({
    name: 'prueba'
});
var socket = io.connect('http://localhost:8080');
//var socket = io.connect('http://localhost:8080');

socket.on('connect',function(data){
  var fingerprint = new Fingerprint().get();

    socket.emit('app_user',fingerprint)
})
socket.on('rutaEncontrada', rutaEncontrada)

socket.on('todaslasrutas',todaslasrutas)
socket.on('rutaUnicaEncontrada',rutaUnicaEncontrada)
socket.on('userProfile',function(data){
//  console.log("Entrando :::"+JSON.stringify(data))
try{

  if(!data ) {

    if(localStorage.getItem('profile')!=null){
       $('#NomUsuario').html(localStorage.getItem('usuario'))
        $('#imgUsuario').attr("src",localStorage.getItem('foto'));
    }else{
      window.location='http://localhost:8080'
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
   window.location ='http://localhost:8080';
}


})



socket.io.on('connect_error', function(err) {
  $('.noConnection').css('max-height','60px');
  $('.Connection').css('max-height','0px');
});


var flechas= new L.LayerGroup();
var coorPartida= new Array();
var coorDestino= new Array();
var map= L.map('map',{closePopupOnClick: false}),marker,globalLatiud,globalLongitud,markerTemporal;
var markerPartida,markerDestino,person;
var anim;
var coordenadas =[  {  "partida": []  },  {"destino": []  }]
var greenIcon = L.icon({
    iconUrl: 'static/img/marker_start.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [30, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -50] // point from which the popup should open relative to the iconAnchor
});
var yellowIcon = L.icon({
    iconUrl: 'static/img/marker_stop.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [30, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -50] // point from which the popup should open relative to the iconAnchor
});
var markerTemp = L.icon({
    iconUrl: 'static/img/marker_temporal.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [30, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62]  // the same for the shadow
  //  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
var markerPerson = L.icon({
    iconUrl: 'static/img/persona.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [30, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62]  // the same for the shadow
  //  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
map.on('click', function (e) {
    $('.dots').fadeIn('fast');
    globalLatiud = e.latlng.lat;
    globalLongitud=  e.latlng.lng;
    if (markerTemporal === undefined){
      markerTemporal= L.marker([globalLatiud, globalLongitud], {icon: markerTemp});
      map.addLayer(markerTemporal);
    }else{
      markerTemporal.setLatLng(e.latlng);
    }
    $.getJSON("http://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=" + e.latlng.lat + "&lon=" + e.latlng.lng + "&json_callback=?",
        function (response) {
            console.log(JSON.stringify(response))
            var msj = response.display_name;
            $('#strongCiudad').html(response.address.country+', '+response.address.state+', '+response.address.city);
            $('.dots').fadeOut('fast');
            $('#parrafoDir').html(msj.replace(response.address.postcode+',',"") )
            $('#articlePopup').css('bottom','0')

        }
    );
});
$('#btnCerrarPopup').click(function(e){
  $('#articlePopup').css('bottom','-150px')
});
$(document).ready(function(){
<<<<<<< HEAD

=======

  socket.emit('buscarTodaslasRutas',{})
>>>>>>> 2d28ac6d0b089b69dcb5cfcfef7652e48251b257
  navigator.geolocation.getCurrentPosition(showPosition,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
  //setInterval(function(){ navigator.geolocation.getCurrentPosition(showPositionMove,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true}); }, 2000);

})

function showPosition(position) {
    map.setView([position.coords.latitude, position.coords.longitude], 16);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    person= L.marker([position.coords.latitude, position.coords.longitude], {icon: markerPerson});
    person.bindPopup("<b>Destino</b>").openPopup();
    map.addLayer(person);

}
function showPositionMove(position) {
    map.removeLayer(person);
    person= L.marker([position.coords.latitude, position.coords.longitude], {icon: markerPerson});
    map.addLayer(person);
}
function errorPosition(){
  map.setView([11.004692, -74.808877], 16);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

  //error('No pudimos localizarte','Por favor activa la localziacion para ubicarte')
}

$('#todasRutas ul li').click(function(){

  Lungo.Router.section('rutaEscogida');
})
$('#btnPartida').click(function() {
  //alert($(this).hasClass('btnParodesSelec'));z
  if($(this).hasClass('btnParodesSelec')){
    $(this).removeClass('btnParodesSelec');
    $('#btnPartida span').css('color','white');
    map.removeLayer(markerPartida);

  }else{

    $(this).addClass('btnParodesSelec');
    $('#btnPartida span').css('color','green');
     markerPartida = L.marker([globalLatiud, globalLongitud], {icon: greenIcon});
     coorPartida[0]=globalLatiud;
     coorPartida[1]=globalLongitud;
      map.addLayer(markerPartida);
      map.removeLayer(markerTemporal)
      markerPartida.bindPopup("<b>Partida</b>").openPopup();
      markerTemporal=undefined;
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
    map.removeLayer(markerDestino);

  }else{

    $(this).addClass('btnParodesSelec');
    $('#btnDestino span').css('color','red');
    coordenadas[0].partida[0]=globalLatiud;
    markerDestino = L.marker([globalLatiud, globalLongitud], {icon: yellowIcon});
    coorDestino[0]=globalLatiud;
    coorDestino[1]=globalLongitud;
    map.addLayer(markerDestino);
    map.removeLayer(markerTemporal)
    markerDestino.bindPopup("<b>Destino</b>").openPopup();
    markerTemporal=undefined;
  }
  if($('#btnDestino').hasClass('btnParodesSelec') && $('#btnPartida').hasClass('btnParodesSelec')){
    ocultarFooter()
  }
})
$('#btnBuscarRuta').click(function(){

  $('.dots').fadeIn('fast');
  var array = new Array();
    array[0]=coorPartida
    array[1]=coorDestino
     socket.emit('buscarRuta', array);
})
function ocultarFooter(){
  $('#articlePopup').css('bottom','-150px');
}

var mostrarruta= L.geoJson();
function rutaEncontrada(data){

console.log('********** '+data)
$('#listarutasEncontradas').html('');
  ocultarFooter()
  if(data.length>0){
///Pruebaaaaa
  $('#numRutasEncontradas').html(data.length)
  for (var i = 0; i < data.length; i++) {

    $('#listarutasEncontradas').append(  '<li class="thumb big" id='+data[i]._id+'>'+
      '    <img src="'+data[i].image+'">'+
      '    <div>'+
      '        <div class="on-right text tiny">'+data.city+'</div>'+
      '        <strong>'+data[i].name+'</strong>'+
      '        <span class="text tiny opacity">'+data.flota+'</span>'+
      '        <small>'+
      '           '+data[i].description+''+
      '        </small>'+
      '    </div>'+
      '</li>')

  }

  Lungo.Router.article("main", "todasRutas");

}else{
  Lungo.Notification.error(
    "Error",                      //Title
    "No se encontro ninguna ruta cercana",     //Description
    "cancel",                     //Icon
    7,                            //Time on screen
    afterNotification             //Callback function
);
}
  //mostrarruta=new L.Polyline(data.data.data.loc).addTo(map);
    $('.dots').fadeOut('fast');
}
function error(titulo,msj){
  $('body').append('<div id="error" class="ErrorClass">'+
  '<span class="icon icon-cross" onclick="cerrarError()" id="cerrarError"></span>'+
      '<div class="">'+
          '<span class="icon icon-sad"></span>'+
      '</div>'+
      '<div class="">'+
          '<strong>'+titulo+'</strong>'+
          '<span>'+msj+'</span>'+
      '</div>'+
  '</div>');
}
$('#listarutasEncontradas').on('click','li',function(){
  $('.dots').fadeIn('fast');
<<<<<<< HEAD
  socket.emit('buscarRutaUnica',this.id)

=======
  socket.emit('buscarRutaUnica',{opc:1,id:this.id})

>>>>>>> 2d28ac6d0b089b69dcb5cfcfef7652e48251b257
})
$('#listatodaslasrutas').on('click','li',function(){
  $('.dots').fadeIn('fast');
  socket.emit('buscarRutaUnica',{opc:0,id:this.id})

})
$$('#listarutasEncontradas li').hold(function(){
  Lungo.Notification.html('<article class="list selectable"><ul><li>Informacion Ruta</li></ul></article>');
});
$('#cerrarSesion').click(function(){
  localStorage.clear();
  window.location='http://localhost:8080';
})

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
   BorrarCapaFlechas();
  if (mostrarruta !=undefined) map.removeLayer(mostrarruta);
 Lungo.Router.article("main", "map");

  mostrarruta=new L.Polyline(data.ruta.loc).addTo(map);
  map.setView([data.ruta.loc[0][0],data.ruta.loc[0][1]])
  var arrowHead = L.polylineDecorator(mostrarruta).addTo(flechas);
  flechas.addTo(map);
  var arrowOffset = 0;
   if (anim !=undefined) map.removeLayer(anim);
      anim = window.setInterval(function() {
      arrowHead.setPatterns([
          {offset: arrowOffset+'%', repeat: 80, symbol: L.Symbol.arrowHead({pixelSize: 7, polygon: false, pathOptions: {color: '#DF0101',stroke: true}})}
      ])
      if(++arrowOffset > 20)
          arrowOffset = 0;
  }, 1000);
}

   $('.dots').fadeOut('fast');
}
function BorrarCapaFlechas(){
  map.removeLayer(flechas);
  flechas= new L.LayerGroup();
}
<<<<<<< HEAD
=======
function mostrarrutaDesdeInfo(data){
  socket.emit('buscarRutaUnica',{opc:1,id:data})
   Lungo.Router.article("main", "map");
}
function todaslasrutas(data){
  console.log(JSON.stringify(data))
  for (var i = 0; i < data.length; i++) {

    $('#listatodaslasrutas').append(  '<li class="thumb big" id='+data[i]._id+'>'+
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
}
>>>>>>> 2d28ac6d0b089b69dcb5cfcfef7652e48251b257
