var express = require('express');
var api = express();

api.get('/', function (req, res) {
  res.send('Hello World!');
});

module.exports = api;
