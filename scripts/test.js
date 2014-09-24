var portscanner = require('portscanner');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var phantomjs = require('phantomjs');
var port = require('../package').config.port;

var server = exec('http-server -p ' + port);
var test = spawn('phantomjs', ['./node_modules/node-qunit-phantomjs/lib/runner-list.js', 'http://0.0.0.0:' + port + '/test.html']);
test.stdout.on('data', function(chunk){
    console.log(chunk.toString());
});

test.on('close', function(){
    if (server) {
        server.kill();
    }
});
