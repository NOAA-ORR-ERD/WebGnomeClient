
// Configure RequireJS
require.config({
    baseUrl: '/node_modules',
    priority: ['underscore', 'jqueryui', 'bootstrap'],
    paths: {
        jquery: 'jquery/dist/jquery',
        jqueryui: 'jquery-ui/ui',
        underscore: 'underscore/underscore',
        backbone: 'backbone/backbone',
        moment: 'moment/moment',
        'moment-round': 'moment-round/dist/moment-round',
        mousetrap: 'mousetrap/mousetrap',
        text: 'requirejs-text/text',
        json: 'requirejs-plugins/src/json',
        cesium: 'cesium/Build/CesiumUnminified/Cesium',
        bootstrap: 'bootstrap/dist/js/bootstrap',
        jqueryDatetimepicker: 'jquery-datetimepicker/jquery.datetimepicker',
        compassui: 'compass-rose-ui/compass-rose-ui',
        chosen: 'chosen-js/chosen.jquery',
        fuse: 'fuse.js/src/fuse',
        flot: 'flot/dist/es5/jquery.flot',
        flotsymbol: 'flot/source/jquery.flot.symbol',
        flottime: 'flot/source/jquery.flot.time',
        flotresize: 'flot/source/jquery.flot.resize',
        flotdirection: 'flotdirection/jquery.flot.direction',
        flotspline: 'flotspline/jquery.flot.spline',
        flotstack: 'flot/source/jquery.flot.stack',
        flotpie: 'flot/source/jquery.flot.pie',
        flotfillarea: 'flotfillarea/jquery.flot.fillarea',
        flotselect: 'flot/source/jquery.flot.selection',
        flotgantt: '../jquery.flot.gantt',
        flotneedle: 'flotneedle/flotNeedle',
        flotextents: 'flotextents/src/jquery.flot.extents',
        flotnavigate: 'flot/source/jquery.flot.navigate',
        'fizzy-ui-utils': 'fizzy-ui-utils/',
        html2canvas: 'html2canvas/dist/html2canvas',
        JUMFlotLib: '../jquery.flot.JUMlib',
        masonry: 'masonry-layout/masonry',
        'eventie': 'eventie/',
        eventEmitter: 'eventEmitter/',
        'doc-ready': 'doc-ready/',
        'get-style-property': 'get-style-property/',
        'get-size': 'get-size/',
        'matches-selector': 'matches-selector/',
        outlayer: 'outlayer/',
        sweetalert: 'sweetalert2/dist/sweetalert2.min',
        nucos: 'nucos/nucos',
        relativeimportance: 'relativeimportance/relativeImportance',
        dropzone: 'dropzone/dist/dropzone-amd-module',
        socketio: 'socket.io-client/dist/socket.io',
        localforage: 'localforage/dist/localforage',
        'jquery-mousewheel': 'jquery-mousewheel/jquery.mousewheel',
        'php-date-formatter': 'php-date-formatter/js/php-date-formatter',
        'toastr': 'toastr/toastr',
        raphael: 'raphael/raphael',
        ccapture: 'ccapture.js/src/CCapture',
        gif: 'ccapture.js/src/gif',
        gifworker: 'ccapture.js/src/gif.worker',
        'd3': "d3/dist/d3",
        tinycolor: "tinycolor2/tinycolor",
        cytoscape: "cytoscape/dist/cytoscape.min",
        "layout-base": "layout-base/layout-base",
        "cose-base": "cose-base/cose-base",
        cosebilkent: "cytoscape-cose-bilkent/cytoscape-cose-bilkent",
        cytoscapeklay: "cytoscape-klay/cytoscape-klay",
        klayjs: "klayjs/klay",

        app: "../js/app",
        router: "../js/router",
        main: "../js/main",
        session_timer: "../js/session_timer",
        collection: "../js/collection/",
        model: "../js/model/",
        templates: "../js/templates/",
        views: "../js/views/"
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

