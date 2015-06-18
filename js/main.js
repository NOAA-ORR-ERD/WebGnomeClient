
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
        flotstack: 'lib/flot/jquery.flot.stack',
        flotpie: 'lib/flot/jquery.flot.pie',
        flotfillarea: 'lib/flotfillarea/jquery.flot.fillarea',
        flotselect: 'lib/flot/jquery.flot.selection',
        flotgantt: 'lib/JUMFlot/jquery.flot.gantt',
        flotneedle: 'lib/flotneedle/flotNeedle',
        'fizzy-ui-utils': 'lib/fizzy-ui-utils/',
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
        nucos: 'lib/nucos/nucos',
        dropzone: 'lib/dropzone/dist/dropzone-amd-module',
        socketio: 'lib/socket.io-client/dist/socket.io',
        localforage: 'lib/localforage/dist/localforage',
        jasmine: 'lib/jasmine/lib/jasmine-core/jasmine',
        'jasmine-html': 'lib/jasmine/lib/jasmine-core/jasmine-html',
        'jasmine-boot': 'lib/jasmine/lib/jasmine-core/boot' 
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
        flotneedle: ['flot'],
        flotstack: ['flot'],
        flotpie: ['flot'],
        flotfillarea: ['flot'],
        flotselect: ['flot'],
        flotgantt: ['JUMFlotLib'],
        JUMFlotLib: ['flot'],
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
            exports: '$'
        },
        sweetalert: {
            exports: 'swal'
        },
        socketio: {
            exports: 'io'
        },
        localforage: {
            exports: 'localforage'
        },
        'jasmine-html': {
            deps : ['jasmine']
        },
        'jasmine-boot': {
            deps : ['jasmine', 'jasmine-html']
        }
    },
});

// set up the app
require([
    'app',
], function(App){
    'use strict';
    window.webgnome = App;
    webgnome.initialize();
});