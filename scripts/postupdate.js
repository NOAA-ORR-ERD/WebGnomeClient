var bower = require('bower');
var lessc = require('less');
var fs = require('fs');
var styles = './css/less/style.less';
var dest = './css/style.css';

bower.commands.install().on('end', function(installed){
    bower.commands.update().on('end', function(updated){
        fs.readFile(styles, 'utf8', function(err, data){
            if (err) throw err;
            lessc.render(data, {filename: styles})
                .then(function(output){
                fs.writeFile(dest, output.css, function(err){
                    if (err) throw err;
                    console.log('successful write!');
                });
            },
            function(error){
                throw error;
            });
        });
           
    });
});


