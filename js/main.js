// Configure RequireJS
require.config({
    baseUrl: 'js',
    priority: ['underscore', 'jqueryui', 'bootstrap'],
    paths: {
        jquery: 'lib/jquery/dist/jquery',
        jqueryui: 'lib/jquery-ui/ui/jquery.ui.core',
        'jquery.ui.widget': 'lib/jquery-file-upload/js/vendor/jquery.ui.widget',
        underscore: 'lib/underscore/underscore',
        backbone: 'lib/backbone/backbone',
        moment: 'lib/moment/moment',
        mousetrap: 'lib/mousetrap/mousetrap',
        geolib: 'lib/geolib/dist/geolib',
        text: 'lib/requirejs-text/text',
        ol: 'lib/openlayers/build/ol-simple',
        bootstrap: 'lib/bootstrap/dist/js/bootstrap',
        jqueryFileupload: 'lib/jquery-file-upload/js/jquery.fileupload',
        jqueryDatetimepicker: 'lib/datetimepicker/jquery.datetimepicker',
        qunit: 'lib/qunit/qunit/qunit'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        bootstrap: ['jquery'],
        jqueryui: ['jquery'],
        jqueryDatetimepicker: ['jquery'],
        ol: {
            exports: 'ol'
        },
        qunit: {
            exports: 'QUnit',
            init: function() {
                QUnit.config.autoload = false;
                QUnit.config.autostart = false;
            }
        }
    },
});

// set up the app
require([
    'app',
], function(App){
    window.webgnome = App;
    webgnome.initialize();
});