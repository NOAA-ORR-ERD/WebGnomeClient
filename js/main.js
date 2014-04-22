// Configure RequireJS
require.config({
    baseUrl: "js",
    priority: ['lib/underscore', 'lib/jquery.ui'],
    paths: {
        jquery: 'lib/jquery-1.11.0.min',
        jqueryui: 'lib/jquery-ui-1.10.4.custom.min',
        underscore: 'lib/underscore-min',
        backbone: 'lib/backbone-min',
        sinon: 'lib/sinon-1.6.0',
        rivets: 'lib/rivets.min'
    },
    shim: {
        'map_generator': ['jquery'],
        'lib/jquery.dynatree': ['lib/jquery.ui', 'lib/jquery.cookie'],
        'lib/rivets': {
            exports: 'rivets'
        },
        'lib/mousetrap': {
            exports: 'Mousetrap'
        },
        'lib/geo': {
            exports: 'Geo'
        },
        'lib/jquery.fileupload': ['lib/jquery.ui'],
        'lib/jquery.imagesloaded.min': ['jquery'],
        'lib/bootstrap.min': ['jquery'],
        'lib/jquery.datetimepicker': ['jquery'],
        'lib/ol': {
            exports: 'ol'
        },
        'lib/ol-simple': {
            exports: 'ol'
        }
    }
});

// set up the app
require([
    'app',
], function(App){
    window.webgnome = App;
    webgnome.initialize();
});