var bower = require('bower');
var lessc = require('less');
var fs = require('fs');
var styles = './css/less/style.less';
var dest = './css/style.css';

bower.commands.install().on('end', function(installed){
    var installedNames = Object.keys(installed);
    if (installedNames.length === 0){
        console.log('No new bower packages installed\n');
    } else {
        console.log('The following bower packages were installed:\n');
        for (var i = 0; i < installedNames.length; i++){
            var substr = installedNames[i] + ', version: ' + installed[installedNames[i]].pkgMeta.version;
            console.log(substr);
        }
    }
    bower.commands.update().on('end', function(updated){
        var updatedNames = Object.keys(updated);
        if (updatedNames.length === 0){
            console.log('No bower packages were updated');
        } else {
            console.log('The following bower packages were updated:\n');
            for (var i = 0; i < updatedNames.length; i++){
                var substr = updatedNames[i] + ', version: ' + updated[updatedNames[i]].pkgMeta.version;
                console.log(substr);
            }
        }
        bower.commands.prune().on('end', function(pruned){
            var prunedDeps = Object.keys(pruned);
            if (prunedDeps.length === 0){
                console.log('No bower packages were pruned');
            } else {
                console.log('The following bower packages were pruned:\n');
                for (var i = 0; i < prunedDeps.length; i++){
                    var substr = prunedDeps[i];
                    console.log(substr);
                }
            }
            fs.readFile(styles, 'utf8', function(err, data){
                if (err) throw err;
                lessc.render(data, {filename: styles, compress: true})
                    .then(function(output){
                    fs.writeFile(dest, output.css, function(err){
                        if (err) throw err;
                        console.log('\nLess files compiled successfully to style.css!');
                    });
                },
                function(error){
                    throw error;
                });
            });
        });
    });
});


