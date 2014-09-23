var package =  require('../package');
var exec = require('child_process').exec;
var port = package.config.port;

var child = exec('http-server -p ' + port);
console.log('Client started on port ' + port);
return child;