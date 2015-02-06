var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var colors = require('colors');
var phantomjs = require('phantomjs');
var port = 8080; //require('../package').config.port;

var server = exec('http-server -p ' + port);
var test = spawn('phantomjs', ['./node_modules/node-qunit-phantomjs/lib/runner-list.js', 'http://0.0.0.0:' + port + '/test.html']);
test.stdout.on('data', function(chunk){
    var str = chunk.toString();
    if(str.indexOf('✔') !== -1){
        str = str.green;
    } else if(str.indexOf('✖') !== -1 || str.indexOf('Failed') !== -1 || str.indexOf('cannot load') !== -1) {
        str = str.red;
    }
    process.stdout.write(str);
});

test.on('close', function(){
    if (server) {
        server.kill();
    }
});
