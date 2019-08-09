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
                    optimize: 'none'
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
            },
            keepalive: {
                options:{
                    port: 8080,
                    hostname: '*',
                    keepalive: true
                }
            },
            build: {
                options:{
                    port: 8080,
                    hostname: '*',
                    keepalive: true,
                    base: 'dist/build/'
                }
            }
        },
        copy: {
            build: {
                expand: true,
                src: [
                    'favicon.ico',
                    'fonts/*',
                    'img/*',
                    'css/images/*',
                    'resource/*',
                    'js/lib/federated-analytics/federated-analytics.js'
                ],
                dest: 'dist/build/'
            },
            cesium: {
                expand: true,
                src: [
                    'js/lib/cesium/Build/Cesium/ThirdParty/**',
                    'js/lib/cesium/Build/Cesium/Assets/**',
                    'js/lib/cesium/Build/Cesium/Widgets/**',
                    'js/lib/cesium/Build/Cesium/Workers/**',
                    'js/lib/cesium/Build/Documentation/images/**'
                ],
                dest: 'dist/build/'
            },
            ccapture: {
                expand: true,
                src:[
                    'js/lib/ccapture.js/src/gif.worker.js'
                ],
                dest:'dist/build/'
            }
        },
        inline: {
            options: {
                tag: '__inline',
            },
            build: {
                src: 'build-template.html',
                dest: 'dist/build/index.html'
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
                "esversion": 6,
                "globals": {
                    "console": true,
                    "alert": true,
                    "confirm": true,
                    "Worker": true,
                    "postMessage": true,
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
                    "moment": true,
                    "require": true,
                    "Promise": true,
                    "Uint8Array": true,
                    "Float32Array": true,
                    "Float64Array": true,
                    "ArrayBuffer": true,
                    "Blob": true,
                    "navigator": true,
                    "URL": true,
                    "MouseEvent": true,
                    "location": true,
                    "ga": true
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
            all:{
                configFile: './wdio.conf.js'
            }
        },
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
    grunt.loadNpmTasks('grunt-vulcanize');

    grunt.registerTask('install', ['bower:install']);
    grunt.registerTask('develop', ['install', 'less:compile', 'connect:start', 'watch:css']);
    grunt.registerTask('build:lite', ['less:compile']);
    grunt.registerTask('build', ['jshint:all', 'less:build', 'requirejs:build', 'copy:build', 'copy:cesium', 'copy:ccapture', 'inline:build']);
    grunt.registerTask('serve', ['connect:keepalive']);
    grunt.registerTask('serve:build', ['connect:build']);
    grunt.registerTask('docs', ['jsdoc:docs']);
    grunt.registerTask('lint', ['jshint:all']);
    grunt.registerTask('test', ['jshint:all', 'webdriver:all']);
    grunt.registerTask('test:demos', ['webdriver:demos']);

};
