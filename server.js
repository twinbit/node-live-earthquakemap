var app = require('./app').init(8000);
var io  = require('socket.io');
var sio = io.listen(app);
var http = require('http');
var twitter = require('tuiter');


// Twitter client
var twit = new twitter({
  'consumer_key': 'GJmAMUrCRjG8dulCdqs0Q',
  'consumer_secret': 'LGNIXaskuQpwcvGi3rg3FjngQnIjb5OYeUzcYk7TE',
  'access_token_key': '9241712-L92IKTYb5hYSI57FNM82ngX5yFCCJfPpPfPxBwDkSa',
  'access_token_secret': 'fbhyhLExUMNij6QhCsMrmxYzhZQczKj72c23oUkk2Q'
});


var getTweet = function(f, e) {
   twit.filter({track: ['#earthquake', '#terremoto']}, function(stream){
    stream.on('data', function(data){
      f(data);
    });

    stream.on('error', function(err){
      // do nothing
      console.log(err);
    });
  });
}


/* Application configuration */
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


/* Get remote feed function */
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
     // start sending tweets
     getTweet(function(data) {
       socket.emit('tweet', {tweet: data});         
     });
  })

  socket.on('time', function (data) {
    getFeed(data, function(obj) {
      socket.emit('earthquakes', { points: obj });
    })
  });
});




