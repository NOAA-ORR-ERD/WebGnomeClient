module.exports = function(grunt){
    var src = [
        'Gruntfile.js',
        'js/*.js',
        'js/collection/*.js',
        'js/model/*.js',
        'js/model/**/*.js',
        'js/views/*.js',
        'js/views/**/*.js',
        '!js/views/tests/*.js',
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            build: {
                options: {
                    baseUrl: 'js',
                    mainConfigFile: 'js/main.js',
                    paths: {
                        requireLib: 'lib/requirejs/require',
                        boot: 'boot'
                    },
                    include: ['requireLib', 'boot'],
                    name: 'main',
                    out: 'dist/build/build.js',
                    optimize: 'uglify2'
                }
            }
        },
        jshint: {
            options: {
                "curly": true,
                "eqnull": true,
                "eqeqeq": true,
                "undef": true,
                "globals": {
                    "console": true,
                    "alert": true,
                    "webgnome": true,
                    "define": true,
                    "localStorage": true,
                    "setTimeout": true,
                    "setInterval": true,
                    "clearInterval": true,
                    "window" : true,
                    "document": true,
                    "module": true,
                    "require": true
                }
            },
            all: src
        },
        jsdoc: {
            docs: {
                src: src,
                options: {
                    destination: 'dist/docs'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('build', ['jshint:all', 'requirejs:build']);
    grunt.registerTask('docs', ['jsdoc:docs']);
    grunt.registerTask('lint', ['jshint:all']);

};