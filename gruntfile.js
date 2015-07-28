module.exports = function(grunt){
    var src = [
        'gruntfile.js',
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
        bower: {
            install: {
                options: {
                    cleanTargetDir: true,
                    copy: false,
                    targetDir: './js/lib'
                }
            }
        },
        connect: {
            start:{
                options: {
                    port: 8080,
                    hostname: '*'
                }
            }
        },
        copy: {
            build: {
                expand: true,
                src: ['favicon.ico', 'fonts/*', 'img/*', 'css/images/*'],
                dest: 'dist/build/'
            }
        },
        inline: {
            options: {
                tag: '',
            },
            build: {
                src: 'build-template.html',
                dest: 'dist/build/build.html'
            }
        },
        less: {
            compile: {
                options: {
                    syncImport: true,
                    relativeUrls: true
                },
                files: {
                    'css/style.css': 'css/less/style.less'
                }
            },
            build: {
                options: {
                    ieCompat: true,
                    compress: true,
                    strictImports: true,
                    syncImport: true,
                    relativeUrls: true,
                    plugins: [
                        new require('less-plugin-inline-urls')
                    ]
                },
                files: {
                    'dist/build/style.css': 'css/less/style.less'
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
                    "clearTimeout": true,
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
        },
        watch: {
            css: {
                files: 'css/less/*',
                tasks: ['less:compile'],
                options: {
                    debounceDelay: 0
                }
            }
        },
        webdriver:{
            options: {
                desiredCapabilities: {
                    browserName: 'chrome'
                }
            },
            all: {
                tests: ['tests/**/*.js']
            },
            demos: {
                tests: ['tests/demos.js']
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-webdriver');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-inline');

    grunt.registerTask('install', ['bower:install']);
    grunt.registerTask('develop', ['install', 'less:compile', 'connect:start', 'watch:css']);
    grunt.registerTask('build:lite', ['less:compile']);
    grunt.registerTask('build', ['jshint:all', 'less:build', 'requirejs:build', 'copy:build', 'inline:build']);
    grunt.registerTask('serve', ['connect:start']);
    grunt.registerTask('docs', ['jsdoc:docs']);
    grunt.registerTask('lint', ['jshint:all']);
    grunt.registerTask('test', ['jshint:all', 'webdriver:all']);
    grunt.registerTask('test:demos', ['webdriver:demos']);

};