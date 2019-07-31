
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
        'moment-round': 'lib/moment-round/dist/moment-round',
        mousetrap: 'lib/mousetrap/mousetrap',
        text: 'lib/requirejs-text/text',
        json: 'lib/requirejs-plugins/src/json',
        cesium: 'lib/cesium/Build/Cesium/Cesium',
        bootstrap: 'lib/bootstrap/dist/js/bootstrap',
        jqueryDatetimepicker: 'lib/datetimepicker/jquery.datetimepicker',
        compassui: 'lib/compass-rose-ui/compass-rose-ui',
        chosen: 'lib/chosen/chosen.jquery',
        fuse: 'lib/fuse/src/fuse',
        flot: 'lib/flot/jquery.flot',
        flotsymbol: 'lib/flot/jquery.flot.symbol',
        flottime: 'lib/flot/jquery.flot.time',
        flotresize: 'lib/flot/jquery.flot.resize',
        flotdirection: 'lib/flotdirection/jquery.flot.direction',
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
        'eventie': 'lib/eventie/',
        eventEmitter: 'lib/eventEmitter/',
        'doc-ready': 'lib/doc-ready/',
        'get-style-property': 'lib/get-style-property/',
        'get-size': 'lib/get-size/',
        'matches-selector': 'lib/matches-selector/',
        outlayer: 'lib/outlayer/',
        sweetalert: 'lib/sweetalert2/dist/sweetalert2.min',
        nucos: 'lib/nucos/nucos',
        relativeimportance: 'lib/relativeimportance/relativeImportance',
        dropzone: 'lib/dropzone/dist/dropzone-amd-module',
        socketio: 'lib/socket.io-client/dist/socket.io',
        localforage: 'lib/localforage/dist/localforage',
        'jquery-mousewheel': 'lib/jquery-mousewheel/jquery.mousewheel',
        'php-date-formatter': 'lib/php-date-formatter/js/php-date-formatter',
        'toastr': 'lib/toastr/toastr',
        raphael: 'lib/raphael/raphael',
        ccapture: 'lib/ccapture.js/src/CCapture',
        whammy: 'lib/whammy/whammy',
        gif: 'lib/ccapture.js/src/gif',
        gifworker: 'lib/ccapture.js/src/gif.worker',
        'd3': "lib/d3/d3",
        tinycolor: "lib/tinycolor/tinycolor",
        cytoscape: "lib/cytoscape/dist/cytoscape",
        cosebilkent: "lib/cytoscape-cose-bilkent/cytoscape-cose-bilkent",
        cytoscapeklay: "lib/cytoscape-klay/cytoscape-klay",
        klayjs: "lib/klayjs/klay",
    },
    shim: {
        jquery: {
            exports: '$'
        },
        toastr:{
            exports: 'toastr',
            deps: ['jquery']
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
        'moment-round': ['moment'],
        html2canvas: {
            exports: 'html2canvas'
        },
        JUMFlotLib: ['flot'],
        jqueryDatetimepicker: ['jquery', 'jquery-mousewheel', 'php-date-formatter'],
        'jquery-mousewheel': ['jquery'],
        'php-date-formatter': {
            exports: 'DateFormatter'
        },
        cesium: {
            exports: 'Cesium'
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
        },
        gifworker: {
            exports: 'gifworker'
        },
        gif: {
            exports: 'gif'
        },
        ccapture: {
           deps: ['gifworker', 'gif'],
           exports: 'ccapture'
        },
        klayjs: {
            exports: 'klay',
            init: function() {
                this.klay = this.$klay;
            }
        },
        cytoscapeklay: {
            deps: ['klayjs'],
            exports: 'cytoscapeklay'
        }
    }
});

