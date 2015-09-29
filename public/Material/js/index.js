var map= L.map('map',{closePopupOnClick: false});
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
    $.getJSON("http://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=" + e.latlng.lat + "&lon=" + e.latlng.lng + "&json_callback=?",
        function (response) {
           $('#modal1').openModal();
            console.log(JSON.stringify(response))
            Materialize.showStaggeredList('#infoPuntoEscogido')
            var msj = response.display_name;
            $('#strongCiudad').html(response.address.country+', '+response.address.state+', '+response.address.city);
            $('#parrafoDir').html(msj.replace(response.address.postcode+',',"") )


        }
    );
});
$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
  });
