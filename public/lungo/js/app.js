Lungo.init({
    name: 'prueba'
});
var socket = io.connect('http://104.131.226.138:8080',{'forceNew':true });
var fingerprint = new Fingerprint().get();
var coorPartida= new Array();
var coorDestino= new Array();
var tempDir;
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
 window.addEventListener('load',function(){
 	socket.emit('buscarTodaslasRutas',{})
   map = new google.maps.Map(document.getElementById("map"),mapOptions);
    navigator.geolocation.getCurrentPosition(showPosition,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
  // setInterval(function(){ navigator.geolocation.getCurrentPosition(showPositionMove,errorPosition,{maximumAge:600000, timeout:5000, enableHighAccuracy: true}); }, 2000);

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

var centerPosition = new google.maps.LatLng(latitude, longitude);

var marker = new google.maps.Marker({
   position: centerPosition,
   map: map,
   icon:'static/img/persona2.png',
    animation: google.maps.Animation.DROP,

});

// var circle = new google.maps.Circle({
//     center: centerPosition,
//     radius: accuracy,
//     map: map,
//     fillColor: '#0000FF',
//     fillOpacity: 0.3,
//     strokeColor:"#0A0A2A",
//     strokeOpacity: 0.3
// });

var bounds = new google.maps.LatLngBounds();
bounds.extend(centerPosition);
map.fitBounds(bounds);
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
	var flightPlanCoordinates = [];
	for (var i = data.ruta.loc.length - 1; i >= 0; i--) {
		flightPlanCoordinates.push({lat:data.ruta.loc[i][0], lng:data.ruta.loc[i][1]})
	};
   
  var flightPath = new google.maps.Polyline({
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
  }, 800);
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
