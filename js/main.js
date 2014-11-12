
// Configure RequireJS
require.config({
    baseUrl: 'js',
    priority: ['underscore', 'jqueryui', 'bootstrap'],
    paths: {
        jquery: 'lib/jquery/dist/jquery',
        jqueryui: 'lib/jquery-ui/ui',
        'jquery.ui.widget': 'lib/jquery-file-upload/js/vendor/jquery.ui.widget',
        underscore: 'lib/underscore/underscore',
        backbone: 'lib/backbone/backbone',
        moment: 'lib/moment/moment',
        mousetrap: 'lib/mousetrap/mousetrap',
        text: 'lib/requirejs-text/text',
        ol: 'lib/openlayers/build/ol',
        bootstrap: 'lib/bootstrap/dist/js/bootstrap',
        jqueryFileupload: 'lib/jquery-file-upload/js/jquery.fileupload',
        jqueryDatetimepicker: 'lib/datetimepicker/jquery.datetimepicker',
        compassui: 'lib/compass-rose-ui/compass-rose-ui',
        fancytree: 'lib/fancytree/dist/jquery.fancytree',
        chosen: 'lib/chosen/chosen.jquery',
        fuse: 'lib/fuse/src/fuse',
        flot: 'lib/flot/jquery.flot',
        flotsymbol: 'lib/flot/jquery.flot.symbol',
        flottime: 'lib/flot/jquery.flot.time',
        flotresize: 'lib/flot/jquery.flot.resize',
        flotdirection: 'lib/flotdirection/index',
        flotspline: 'lib/flotspline/jquery.flot.spline',
        flottooltip: 'lib/flot.tooltip/js/jquery.flot.tooltip',
        flotcrosshair: 'lib/flot/jquery.flot.crosshair',
        flotstack: 'lib/flot/jquery.flot.stack',
        flotpie: 'lib/flot/jquery.flot.pie',
        flotfillarea: 'lib/flotfillarea/jquery.flot.fillarea',
        flotgantt: 'lib/JUMFlot/jquery.flot.gantt',
        JUMFlotLib: 'lib/JUMFlot/jquery.flot.JUMlib',
        masonry: 'lib/masonry/masonry',
        eventie: 'lib/eventie/',
        'doc-ready': 'lib/doc-ready/',
        eventEmitter: 'lib/eventEmitter/',
        'get-style-property': 'lib/get-style-property/',
        'get-size': 'lib/get-size/',
        'matches-selector': 'lib/matches-selector/',
        outlayer: 'lib/outlayer/',
        sweetalert: 'lib/sweetalert/lib/sweet-alert',
        nucos: 'lib/nucos/nucos'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        bootstrap: ['jquery'],
        jqueryui: ['jquery'],
        flot: ['jquery'],
        flotsymbol: ['flot'],
        flottime: ['flot'],
        flotresize: ['flot'],
        flotdirection: ['flot'],
        flotspline: ['flot'],
        flottooltip: ['flot'],
        flotcrosshair: ['flot'],
        flotstack: ['flot'],
        flotpie: ['flot'],
        flotfillarea: ['flot'],
        flotgantt: ['JUMFlotLib', 'flot'],
        jqueryDatetimepicker: ['jquery'],
        ol: {
            exports: 'ol'
        },
        compassui: {
            exports: '$',
            deps: ['jquery']
        },
        fancytree: {
            deps: ['jquery', 'jqueryui/core', 'jqueryui/widget']
        },
        chosen: {
            deps: ['jquery'],
            exports: 'jQuery.fn.chosen'
        },
        sweetalert: {
            exports: 'swal'
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