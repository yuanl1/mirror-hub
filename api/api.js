var express = require('express');
var api = express();

api.get('/', function (req, res) {
  res.send('Hello Worldddd');
});

module.exports = api;
