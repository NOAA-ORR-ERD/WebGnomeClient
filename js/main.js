// Configure RequireJS
require.config({
    baseUrl: "js",
    priority: ['lib/underscore', 'lib/jquery.ui'],
    paths: {
        jquery: 'lib/jquery-1.11.0.min',
        jqueryui: 'lib/jquery-ui-1.10.4.custom.min',
        underscore: 'lib/underscore-min',
        backbone: 'lib/backbone-min',
        moment: 'lib/moment'
    },
    shim: {
        // figure out what key was pressed during a mousedown event.
        'lib/mousetrap': {
            exports: 'Mousetrap'
        },
        // convert geo positional information into different formats
        'lib/geo': {
            exports: 'Geo'
        },
        'lib/jquery.fileupload': ['jqueryui'],
        'lib/bootstrap.min': ['jquery'],
        'lib/jquery.datetimepicker': ['jquery'],
        'lib/ol': {
            exports: 'ol'
        },
        'lib/ol-simple': {
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