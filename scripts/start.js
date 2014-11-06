var port = require('../package').config.port;
var exec = require('child_process').exec;

var child = exec('http-server -p ' + port);
console.log('Client started on port ' + port);
return child;