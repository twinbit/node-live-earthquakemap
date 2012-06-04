var app = require('./app').init(4000);
var io  = require('socket.io');
var sio = io.listen(app);
var http = require('http');

var locals = {
        title: 		 'Live Earthquakes Map',
        description: 'Live Earthquakes Map built with nodejs + leaflet',
        author: 	 'Paolo Mainardi - Twinbit - http://www.twinbit.it'
    };

app.get('/', function(req,res) {
    locals.date = new Date().toLocaleDateString();
    res.render('template.ejs', locals);
});

/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});



var getFeed = function(data, f) {
  var path;
  if (data == 'all') {
    path = '/earthquakes/feed/geojson/2.5/month'
  }
  else if (data == 'week') {
    path = '/earthquakes/feed/geojson/1.0/week';
  }
  else if (data == 'hour') {
    path = '/earthquakes/feed/geojson/all/hour';
  }
  else if (data == 'day') {
    path = '/earthquakes/feed/geojson/all/day';
  }

  var options = {
    host: 'earthquake.usgs.gov',
    port: 80,
    path: path,
    verb: 'GET'
  };
  /* http://www.geonet.org.nz/resources/earthquake/quake-web-services.html
  var options = {
    host: 'magma.geonet.org.nz',
    port: 80,
    path: (data == 'all' ? '/services/quake/geojson/quake?numberDays=1' : '/earthquakes/feed/geojson/all/hour'),
    verb: 'GET'
  };
  */

  http.get(options, function(res) {
    var data = '';

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end',function(err) {
      var obj = JSON.parse(data);
      f(obj);
    })

    res.on('error', function(err) {
      console.log("Error during HTTP request");
    });
  });
}


// get the data from: http://earthquake.usgs.gov/earthquakes/feed/
sio.sockets.on('connection', function (socket) {
  getFeed('all', function(obj) {
     socket.emit('earthquakes', { points: obj });
  })

  socket.on('time', function (data) {
    getFeed(data, function(obj) {
      socket.emit('earthquakes', { points: obj });
    })
  });

});