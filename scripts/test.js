var portscanner = require('portscanner');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var phantomjs = require('phantomjs');
var port = require('../package').config.port;

var server = exec('http-server -p ' + port);
var test = exec('phantomjs ./node_modules/node-qunit-phantomjs/lib/runner.js http://0.0.0.0:' + port + '/test.html', function(err, stdout){
    console.log(stdout);

    if(server){
        server.kill();
    }
});