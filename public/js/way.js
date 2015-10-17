var socket = io.connect('http://localhost:8080',{'forceNew':true });
var fingerprint = new Fingerprint().get();
var coorPartida= new Array();
var coorDestino= new Array();
var latlng, markerPartida, markerDestino, markerTemporal;
socket.on('rutaEncontrada', rutaEncontrada)
socket.on('rutaUnicaEncontrada',rutaUnicaEncontrada)
socket.on('userProfile',function(data){
  console.log(JSON.stringify(data))
  ///if(data._id ===undefined) window.location ='http://busroute-pruebanodejs.rhcloud.com/';
  localStorage.setItem("profile", data._id);
  $('#nomUsuario').html(data.name)
  $('#imgUsuario').attr("src",data.photo);
})

var geocoder = new google.maps.Geocoder;
var infowindow = new google.maps.InfoWindow;
var mapOptions = {
       center: new google.maps.LatLng(10.942071365517807,-74.78217601776123),
       zoom: 16,
       mapTypeId: google.maps.MapTypeId.ROADMAP
     };
window.addEventListener("load",function(){
  map = new google.maps.Map(document.getElementById("map"),
      mapOptions);
  socket.on('connect',function(data){
      socket.emit('app_user',fingerprint);
      $('.noConnection').css('max-height','0px');
      $('.Connection').css('max-height','60px');
      setTimeout(function(){ $('.Connection').css('max-height','0px');}, 2000);
  });
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
  $('#btnPartida').click(function() {
    //alert($(this).hasClass('btnParodesSelec'));z
    if($(this).hasClass('btnParodesSelec')){
      $(this).removeClass('btnParodesSelec');
      $('#btnPartida span').css('color','white');
      markerPartida.setMap(null);

    }else{

      $(this).addClass('btnParodesSelec');
      $('#btnPartida span').css('color','green');
      markerTemporal.setMap(null);
      coorPartida[0]=latlng.lat();
      coorPartida[1]=latlng.lng();
       markerPartida = new google.maps.Marker({
          position: latlng,
          map: map,
          icon:'static/img/marker_start.png'

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
      markerTemporal.setMap(null);
      coorDestino[0]=latlng.lat();
      coorDestino[1]=latLng.lng();//Quede por aqu error HP
       markerDestino = new google.maps.Marker({
          position: latlng,
          map: map,
          icon:'static/img/marker_stop.png'

        });
    if($('#btnDestino').hasClass('btnParodesSelec') && $('#btnPartida').hasClass('btnParodesSelec')){
      ocultarFooter()
    }
  }
  })

});

$('#btnBuscarRuta').click(function(){
  $('.dots').fadeIn('fast');
  alert(JSON.stringify (latlng.lng()))
  // var array = new Array();
  //   array[0]=coorPartida
  //   array[1]=coorDestino
  //    socket.emit('buscarRuta', array);
})
$('#btnCerrarPopup').click(function(e){
  $('#articlePopup').css('bottom','-150px')
});


// functones
function ocultarFooter(){
  $('#articlePopup').css('bottom','-150px');
}
function rutaEncontrada(data){}
function rutaUnicaEncontrada(data){}
