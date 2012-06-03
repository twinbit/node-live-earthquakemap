var app = require('./app').init(4000);
var io  = require('socket.io');
var sio = io.listen(app);
var http = require('http');

var locals = {
        title: 		 'Earthquake live map',
        description: 'Eartquake live maps built with nodejs',
        author: 	 'Paolo Mainardi'
    };

app.get('/', function(req,res) {
    locals.date = new Date().toLocaleDateString();
    res.render('template.ejs', locals);
});

/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});

// get the data from: http://earthquake.usgs.gov/earthquakes/feed/
sio.sockets.on('connection', function (socket) {
  var options = {
    host: 'earthquake.usgs.gov',
    port: 80,
    path: '/earthquakes/feed/geojson/2.5/month',
    verb: 'GET'
  };

  http.get(options, function(res) {
    var data = '';

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end',function(err) {
      var obj = JSON.parse(data);
      socket.emit('earthquakes', { points: obj });
    })

    res.on('error', function(err) {
      console.log("Error during HTTP request");
      //console.log(err);
    });
  });
});