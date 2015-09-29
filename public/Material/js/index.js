var socket = io.connect('http://busroute-pruebanodejs.rhcloud.com:8000',{'forceNew':true });
socket.on('rutaEncontrada', rutaEncontrada)
socket.on('rutaUnicaEncontrada',rutaUnicaEncontrada)
var coorPartida= new Array();
var coorDestino= new Array();
var mostrarruta= L.geoJson();
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
  navigator.geolocation.getCurrentPosition(showPosition,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
  setInterval(function(){ navigator.geolocation.getCurrentPosition(showPositionMove,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true}); }, 2000);

});
function showPosition(position) {
    map.setView([position.coords.latitude, position.coords.longitude], 16);
    L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'your.mapbox.public.access.token'
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
  L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'your.mapbox.public.access.token'
  }).addTo(map);
  //error('No pudimos localizarte','Por favor activa la localziacion para ubicarte')
}
map.on('click', function (e) {
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
           
            var msj = response.display_name;

            $('#strongCiudad').html(response.address.country+', '+response.address.state+', '+response.address.city);
            $('#parrafoDir').html(msj.replace(response.address.postcode+',',"") )
            $('#infoPunto').fadeIn('fast');

        }
    );
});
$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
     $('.button-collapse').sideNav({
      menuWidth: 300, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    }
  );
});
$('#btnPartida').click(function() {
  //alert($(this).hasClass('btnParodesSelec'));z
  if($(this).hasClass('btnParodesSelec')){
    $(this).removeClass('btnParodesSelec');
    $('#btnPartida span').css('color','white');
    map.removeLayer(markerPartida);

  }else{

    $(this).addClass('waves-light');
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
    $('#infoPunto').fadeOut('fast');
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
    $('#infoPunto').fadeOut('fast');
  }
})

$('#btnCerrarPopup').click(function(){
  $('#infoPunto').fadeOut('fast')
})
$('#btnBuscarRuta').click(function(){
  $('.dots').fadeIn('fast');
  var array = new Array();
    array[0]=coorPartida
    array[1]=coorDestino
     socket.emit('buscarRuta', array);
})
function rutaEncontrada(data){
  $('.dots').fadeIn('fast')
  for (var i = data.length - 1; i >= 0; i--) {
    $('#rutasEncontradas').append(' <div class="card">'+
    '<div class="card-image waves-effect waves-block waves-light">'+
      '<img class="activator" src="'+data[i].image+'">'+
    '</div>'+
    '<div class="card-content">'+
      '<span class="card-title activator grey-text text-darken-4">'+data[i].name+'<i class="material-icons right">more_vert</i></span>'+
      '<p><a href="#" id="'+data[i]._id+'" class="btnVerMas">Ver ruta</a></p>'+
    '</div>'+
   ' <div class="card-reveal">'+
      '<span class="card-title grey-text text-darken-4">'+data[i].name+'<i class="material-icons right">close</i></span>'+
      '<p>'+data[i].description+'</p>'+
    '</div>'+
  '</div>')
  };
  $('.dots').fadeOut('fast')
}
$('#rutasEncontradas').on('click','.btnVerMas',function(){
    $('.dots').fadeIn('fast');
    socket.emit('buscarRutaUnica',this.id)

})
function rutaUnicaEncontrada(data){
  $('#rutasEncontradas').fadeOut('fast')
  mostrarruta=new L.Polyline(data.loc).addTo(map);
  $('.dots').fadeOut('fast');
}
