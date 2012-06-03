$(document).ready(function(){
   var map = new L.Map('map');
   var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/8618631df8af451ba9fcbc0d9fb7788d/997/256/{z}/{x}/{y}.png', {
       attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
       maxZoom: 18
   });
   
   var europe = new L.LatLng(38, 30); // geographical point (longitude and latitude)
   map.setView(europe, 4).addLayer(cloudmade);
	
   var geojsonLayer = new L.GeoJSON();
   map.addLayer(geojsonLayer);

   var socket = io.connect('/');



   function setStyle(layer) {

   }

   socket.on('earthquakes', function (data) {
     var points = data.points;

     //var geojsonLayer = new L.GeoJSON(points);


     var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var geojsonLayer = new L.GeoJSON(points, {
        pointToLayer: function (latlng) {
          return new L.CircleMarker(latlng, geojsonMarkerOptions);
        }
    });


    geojsonLayer.on("featureparse", function (e) {
       if (e.properties && e.properties.place) {
         //console.log(e);

         // popup content
         var date = new Date(e.properties.time * 1000);
         e.layer.bindPopup('Place : ' + e.properties.place + '<br />' + 'Date : ' + date +  '<br />' + 'Magnitude : ' + e.properties.mag);

         if (e.properties) {
          var mag = e.properties.mag;
          if (mag > 5) {
            e.layer.options.fillColor = '#FF0000'
            e.layer.setRadius(20);
          }
         }
       }
     }); 

     geojsonLayer.addGeoJSON(points);
     map.addLayer(geojsonLayer);
   });


});



