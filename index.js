var express = require('express');
var app = express();
var api = require('./api/api.js');

app.use(express.static('build'));
app.use('/api', api);


app.listen(8888, function() {
  console.log('App listening on port 8888');
});
