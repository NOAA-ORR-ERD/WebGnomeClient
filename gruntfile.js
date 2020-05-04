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
                    appdir: 'js',
                    baseUrl: 'node_modules',
                    mainConfigFile: 'js/main.js',
                    paths: {
                        requireLib: 'requirejs/require',
                        boot: '../js/boot'
                    },
                    include: ['requireLib', 'boot'],
                    //name: 'main',
                    //name: 'boot',
                    out: 'dist/build/build.js',
                    optimize: 'none'
                }
            }
        },
        connect: {
            start:{
                options: {
                    port: 8079,
                    hostname: '*'
                }
            },
            keepalive: {
                options:{
                    port: 8079,
                    hostname: '*',
                    keepalive: true
                }
            },
            build: {
                options:{
                    port: 8079,
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
                    'node_modules/federated-analytics/federated-analytics.js',
                    'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
                    'node_modules/@google-web-components/google-chart/index.html',
                    'js/session_timer.js'
                ],
                dest: 'dist/build/'
            },
            cesium: {
                expand: true,
                src: [
                    'node_modules/cesium/Build/Cesium/ThirdParty/**',
                    'node_modules/cesium/Build/Cesium/Assets/**',
                    'node_modules/cesium/Build/Cesium/Widgets/**',
                    'node_modules/cesium/Build/Cesium/Workers/**',
                    'node_modules/cesium/Build/Documentation/images/**'
                ],
                dest: 'dist/build/'
            },
            ccapture: {
                expand: true,
                src:[
                    'node_modules/ccapture.js/src/gif.worker.js'
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
                    "ImageData": true,
                    "Uint8Array": true,
                    "Uint8ClampedArray": true,
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
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-webdriver');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-vulcanize');

    grunt.registerTask('develop', ['less:compile', 'connect:start', 'watch:css']);
    grunt.registerTask('build:lite', ['less:compile']);
    grunt.registerTask('build', ['jshint:all', 'less:build', 'requirejs:build', 'copy:build', 'copy:cesium', 'copy:ccapture', 'inline:build']);
    grunt.registerTask('serve', ['connect:keepalive']);
    grunt.registerTask('serve:build', ['connect:build']);
    grunt.registerTask('docs', ['jsdoc:docs']);
    grunt.registerTask('lint', ['jshint:all']);
    grunt.registerTask('test', ['jshint:all', 'webdriver:all']);
    grunt.registerTask('test:demos', ['webdriver:demos']);

};
