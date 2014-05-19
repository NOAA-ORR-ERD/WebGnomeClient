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
    },
    shim: {
        'jqueryui': ['jquery'],
        'jqueryDatetimepicker': ['jquery'],
        'ol': {
            exports: 'ol'
        },
    }
});

// set up the app
require([
    'app',
], function(App){
    window.webgnome = App;
    webgnome.initialize();
});