
// Configure RequireJS
require.config({
    baseUrl: '/js',
    priority: ['underscore', 'jqueryui', 'bootstrap'],
    paths: {
        jquery: 'lib/jquery/dist/jquery',
        jqueryui: 'lib/jquery-ui/ui',
        underscore: 'lib/underscore/underscore',
        backbone: 'lib/backbone/backbone',
        moment: 'lib/moment/moment',
        mousetrap: 'lib/mousetrap/mousetrap',
        text: 'lib/requirejs-text/text',
        ol: 'lib/openlayers/build/ol',
        bootstrap: 'lib/bootstrap/dist/js/bootstrap',
        jqueryDatetimepicker: 'lib/datetimepicker/jquery.datetimepicker',
        compassui: 'lib/compass-rose-ui/compass-rose-ui',
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
        flotextents: 'lib/flotextents/src/jquery.flot.extents',
        flotnavigate: 'lib/flot/jquery.flot.navigate',
        'fizzy-ui-utils': 'lib/fizzy-ui-utils/',
        html2canvas: 'lib/html2canvas/build/html2canvas',
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
        localforage: 'lib/localforage/dist/localforage'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        bootstrap: ['jquery'],
        jqueryui: {
            deps: ['jquery'],
            exports: '$.ui'
        },
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
        flotextents: ['flot'],
        flotnavigate: ['flot'],
        flotgantt: ['JUMFlotLib'],
        html2canvas: {
            exports: 'html2canvas'
        },
        JUMFlotLib: ['flot'],
        jqueryDatetimepicker: ['jquery'],
        ol: {
            exports: 'ol'
        },
        compassui: {
            exports: '$',
            deps: ['jquery']
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
        }
    },
});