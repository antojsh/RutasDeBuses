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
  // socket.on('connect',function(data){
  //     socket.emit('app_user',fingerprint);
  //     $('.noConnection').css('max-height','0px');
  //     $('.Connection').css('max-height','60px');
  //     setTimeout(function(){ $('.Connection').css('max-height','0px');}, 2000);
  // });
  google.maps.event.addListener(map, "click", function(e) {
    $('.dots').fadeIn('fast');
    var latlng = e.latLng;
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          var marker = new google.maps.Marker({
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

});
