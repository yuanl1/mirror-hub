var express = require('express');
var app = express();
var api = require('./api/api.js');

// Set the static files directory
var static_dir = app.get("env") == 'production' ? 'dist' : 'build';
app.use(express.static(static_dir));


// Set the API endpoints
app.use('/api', api);


app.listen(8888, function() {
  console.log('App listening on port 8888');
});
