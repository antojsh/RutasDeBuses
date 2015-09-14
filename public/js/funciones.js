var socket = io.connect('http://busroute-pruebanodejs.rhcloud.com:8000',{'forceNew':true });
var fingerprint = new Fingerprint().get();
socket.on('rutaEncontrada', rutaEncontrada)
socket.on('rutaUnicaEncontrada',rutaUnicaEncontrada)
socket.io.on('connect_error', function(err) {
  alert('Error connecting to server');
});
var coorPartida= new Array();
var coorDestino= new Array();
var map= L.map('map'),marker,globalLatiud,globalLongitud,markerTemporal;
var markerPartida,markerDestino;
var coordenadas =[  {  "partida": []  },  {"destino": []  }]
var greenIcon = L.icon({
    iconUrl: 'static/img/marker_start.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [30, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
  //  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
var yellowIcon = L.icon({
    iconUrl: 'static/img/marker_stop.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [30, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
  //  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
var markerTemp = L.icon({
    iconUrl: 'static/img/marker_temporal.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [30, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
  //  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
var markerPerson = L.icon({
    iconUrl: 'static/img/persona.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [30, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
  //  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
window.addEventListener("load",function(){
  socket.on('connect',function(data){
      socket.emit('app_user',fingerprint);
  });

  navigator.geolocation.getCurrentPosition(showPosition,errorPosition);




});

function showPosition(position) {

    map.setView([position.coords.latitude, position.coords.longitude], 16);
    L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'your.mapbox.public.access.token'
    }).addTo(map);
    var person= L.marker([position.coords.latitude, position.coords.longitude], {icon: markerPerson});
    map.addLayer(person);
}
function errorPosition(){
  map.setView([11.004692, -74.808877], 16);
  L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'your.mapbox.public.access.token'
  }).addTo(map);
  error('No pudimos localizarte','Por favor activa la localziacion para ubicarte')
}
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
// Cerrar el popup de la direccion
$('#btnCerrarPopup').click(function(e){
  $('#articlePopup').css('bottom','-150px')
});

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



// Funciones Sockets
var mostrarruta= L.geoJson();
function rutaEncontrada(data){

console.log('********** '+JSON.stringify(data))
$('#listarutasEncontradas').html('');
  ocultarFooter()
  if(data.length>0){

  for (var i = 0; i < data.length; i++) {

    $('#listarutasEncontradas').append('<li id='+data[i]._id+'>'+
      '<div></div>'+
      '<div>'+
        '<strong>'+data[i].name+'</strong>'+
        '<p>'+data[i].description+'</p>'+
      '</div>'+
    '</li>')
    //$('#'+data[i]._id+' div:first-child').css("background-image", "url('http://localhost:3000/static/"+data[i].image+"')");
  }
  $('#listarutasEncontradas').fadeIn('fast')
}else{
  error('Ups !','No se encontro ninguna ruta cercana, Quieres aumentar el rango de busqueda')
}
  //mostrarruta=new L.Polyline(data.data.data.loc).addTo(map);
    $('.dots').fadeOut('fast');
}
$('#listarutasEncontradas').on('click','li',function(){
    socket.emit('buscarRutaUnica',this.id)
})
$('#divBuscar').submit(function(e){
  e.preventDefault();
  $('.dots').fadeIn('fast');
  var location = $('#txtBuscar').val();//unresolvedLocations
  var geocode = ' http://open.mapquest.com/_svc/searchio?action=search&query0='+location+'&sort=bestmatch&page=0&routeContext='
  $.getJSON(geocode, function(data) {
    console.log(  data[0].address.displayLatLng );

  if( data[0].address.displayLatLng !==null){
    map.setView([data[0].address.displayLatLng.lat, data[0].address.displayLatLng.lng], 16);
    markerTemporal= L.marker([data[0].address.displayLatLng.lat, data[0].address.displayLatLng.lng], {icon: markerTemp});
  }else{

    map.setView([data[0].unresolvedLocations[0].address.displayLatLng.lat, data[0].unresolvedLocations[0].address.displayLatLng.lng], 16);
    markerTemporal= L.marker([data[0].unresolvedLocations[0].address.displayLatLng.lat, data[0].unresolvedLocations[0].address.displayLatLng.lng], {icon: markerTemp});

  }

  map.addLayer(markerTemporal);
  // // let's stringify it
  // var latlngAsString = latlng.join(',');
  // console.log(latlngAsString);

  // the full results JSON
  $('.dots').fadeOut('fast');
  console.log(JSON.stringify( data[0].address.displayLatLng.lat));
});
})

function rutaUnicaEncontrada(data){

  $('#listarutasEncontradas').fadeOut('fast')
  mostrarruta=new L.Polyline(data.loc).addTo(map);
  $('.dots').fadeOut('fast');
}
function error(titulo,msj){
  $('body').append('<div id="error">'+
  '<span class="icon icon-cross" onclick="cerrarError()"></span>'+
      '<div class="">'+
          '<span class="icon icon-sad"></span>'+
      '</div>'+
      '<div class="">'+
          '<strong>'+titulo+'</strong>'+
          '<span>'+msj+'</span>'+
      '</div>'+
  '</div>');
}
function cerrarError(){
  $('#error').fadeOut('fast');
}
