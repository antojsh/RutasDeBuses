var socket = io.connect('http://busroute-pruebanodejs.rhcloud.com',{'forceNew':true });
var fingerprint = new Fingerprint().get();
socket.on('rutaEncontrada', rutaEncontrada)
socket.on('rutaUnicaEncontrada',rutaUnicaEncontrada)
socket.on('userProfile',function(data){
  if(localStorage.getItem('profile') === undefined || localStorage.getItem('profile' || data._id ===undefined) == null) window.location ='http://busroute-pruebanodejs.rhcloud.com/';
  localStorage.setItem("profile", data._id);
  $('#nomUsuario').html(data.name)
  $('#imgUsuario').attr("src",data.photo);
})
socket.io.on('connect_error', function(err) {
  $('.noConnection').css('max-height','60px');
  $('.Connection').css('max-height','0px');
});
var coorPartida= new Array();
var coorDestino= new Array();
var map= L.map('map',{closePopupOnClick: false}),marker,globalLatiud,globalLongitud,markerTemporal;
var markerPartida,markerDestino,person;
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
      $('.noConnection').css('max-height','0px');
      $('.Connection').css('max-height','60px');
      setTimeout(function(){ $('.Connection').css('max-height','0px');}, 2000);
  });

  navigator.geolocation.getCurrentPosition(showPosition,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
  setInterval(function(){ navigator.geolocation.getCurrentPosition(showPositionMove,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true}); }, 2000);

});
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



// Funciones Sockets
var mostrarruta= L.geoJson();
function rutaEncontrada(data){

console.log('********** '+data)
$('#listarutasEncontradas').html('');
  ocultarFooter()
  if(data.length>0){
///Pruebaaaaa
  for (var i = 0; i < data.length; i++) {

    $('#listarutasEncontradas').append('<li id='+data[i]._id+'>'+
      '<div></div>'+
      '<div>'+
        '<strong>'+data[i].name+'</strong>'+
        '<p>'+data[i].description+'</p>'+
      '</div>'+
    '</li>')
    var img =   $('#'+data[i]._id+' div:first-child');
    img.css("background-image", "url('"+data[i].image+"')");
    img.css("background-size",'cover');
  }
  $('#rutasEncontradas').css('display','block');
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
$('#btnMenu').click(function(){
  $('#menuLateral').addClass('mostrarMenu');
})
$('#btnCerrarMenu').click(function(){
  $('#menuLateral').removeClass('mostrarMenu');
})
$('#cerrarEncontradas').click(function(){
  $('#rutasEncontradas').fadeOut('slow');
})
function rutaUnicaEncontrada(data){
  if (mostrarruta !=undefined) map.removeLayer(mostrarruta);
  $('#rutasEncontradas').fadeOut('slow');
  mostrarruta=new L.Polyline(data.loc).addTo(map);
  var arrowHead = L.polylineDecorator(mostrarruta).addTo(map);
  var arrowOffset = 0;
  // if (anim !=undefined) map.removeLayer(anim);
  var anim = window.setInterval(function() {
      arrowHead.setPatterns([
          {offset: arrowOffset+'%', repeat: 20, symbol: L.Symbol.arrowHead({pixelSize: 7, polygon: false, pathOptions: {color: '#DF0101',stroke: true}})}
      ])
      if(++arrowOffset > 100)
          arrowOffset = 0;
  }, 1000);

  // var pd = L.polylineDecorator(mostrarruta, {
  //       patterns: [
  //           {offset: 0, repeat: 10, symbol: L.Symbol.dash({pixelSize: 0})}
  //       ]
  //   }).addTo(map);

  // var pathPattern = L.polylineDecorator(
  //     mostrarruta,
  //     {
  //           patterns: [
  //               { offset: 12, repeat: 25, symbol: L.Symbol.dash({pixelSize: 10, pathOptions: {color: '#f00', weight: 2}}) },
  //               { offset: 0, repeat: 25, symbol: L.Symbol.dash({pixelSize: 0}) }
  //           ]
  //       }
  //   ).addTo(map);

  // var pathPattern = L.polylineDecorator(
  //     mostrarruta,
  //       {
  //           patterns: [
  //               { offset: 12, repeat: 10, symbol: L.Symbol.dash({pixelSize: 10, pathOptions: {color: '#f00', weight: 2}}) },
  //               { offset: 0, repeat: 5, symbol: L.Symbol.dash({pixelSize: 0}) }
  //           ]
  //       }
  //   ).addTo(map);

  $('.dots').fadeOut('fast');
}
function error(titulo,msj){
  $('body').append('<div id="error">'+
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
$('#cerrarError').click(function(){
  $('#error').fadeOut('fast');
})
function cerrarError(){
  $('#error').fadeOut('fast');
}
