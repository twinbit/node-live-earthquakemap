$(document).ready(function(){
   var map = new L.Map('map');
   var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/8618631df8af451ba9fcbc0d9fb7788d/997/256/{z}/{x}/{y}.png', {
       attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
       maxZoom: 18
   });
   
   var europe = new L.LatLng(38, 30); // geographical point (longitude and latitude)
   var italy =  new L.LatLng(42.779275,12.733154);
   var modena = new L.LatLng(44.648628,10.912857);
   
   map.setView(europe, 4).addLayer(cloudmade);


   var geojsonLayer = new L.GeoJSON();
   map.addLayer(geojsonLayer);

   var socket = io.connect('/');


   // layer styler object
   // ex: http://stackoverflow.com/questions/3913103/javascript-object-literal-pattern-with-multiple-instances
   var setStyle = function(layer) {
      var Styler =  {
        init: function() {
          this.layer = layer;
        },

        setRadius: function() {
          this.layer.setRadius(20);
        },

        setColor: function(color) {
          this.style = color;
        },

        config: function() {
          console.log(this.layer);
        }
      }

      Styler.init();
      return Styler;
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
         // popup content
         var date = new Date(e.properties.time * 1000);
         e.layer.bindPopup('Place : ' + e.properties.place + '<br />' + 'Date : ' + date +  '<br />' + 'Magnitude : ' + e.properties.mag);

         if (e.properties) {
          var mag = e.properties.mag;
          if (mag > 5) {

            var Styler = new setStyle(e.layer);
            Styler.config();

            /*
            e.layer.options.fillColor = '#FF0000'
            e.layer.options.weight = 2;
            e.layer.setRadius(12);
            */
          }
         }
       }


     }); 

     geojsonLayer.addGeoJSON(points);
     map.addLayer(geojsonLayer);
   });


});



