// basic controller to configure and setup the app
define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'moment',
    'sweetalert',
    'cesium',
    'socketio',
    'text!../config.json',
    'model/cache',
    'model/session',
    'model/gnome',
    'model/risk/risk',
    'model/user_prefs',
    'views/default/loading',
], function($, _, Backbone, Router, moment, swal, Cesium, io,
            config, Cache, SessionModel, GnomeModel, RiskModel, UserPrefs,
            LoadingView) {
    'use strict';
    var app = {
        obj_ref: {},
        initialize: function() {

            //Set Cesium default view rectangle
            var west = -130.0;
            var south = 20.0;
            var east = -60.0;
            var north = 60.0;
            var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);
            Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;
            // Ask jQuery to add a cache-buster to AJAX requests, so that
            // IE's aggressive caching doesn't break everything.
            $.ajaxSetup({
                xhrFields: {
                    withCredentials: true
                }
            });

            this.config = this.getConfig();
            this.configure();
            this.capabilities();

            this.config.date_format.half_hour_times = this.generateHalfHourTimesArray();
            this.config.date_format.time_step = 30;

            this.monitor = {};
            this.monitor.requests = [];

            swal.setDefaults({'allowOutsideClick': false});

            $.ajaxPrefilter(_.bind(function(options, originalOptions, jqxhr) {
                if (options.url.indexOf('http://') === -1 && options.url.indexOf('https://') === -1) {
                    options.url = webgnome.config.api + options.url;
                    // add a little cache busting so IE doesn't cache everything...
                    options.url += '?' + (Math.random() * 10000000000000000);
                }
                else {
                    // if this request is going somewhere other than the webgnome api we shouldn't enforce credentials.
                    delete options.xhrFields.withCredentials;
                }

                // monitor interation to check the status of active ajax calls.
                this.monitor.requests.push(jqxhr);

                if (_.isUndefined(this.monitor.interval)) {
                    this.monitor.start_time = moment().valueOf();

                    this.monitor.interval = setInterval(_.bind(function() {
                        var loading;

                        if (this.monitor.requests.length > 0) {
                            this.monitor.requests = this.monitor.requests.filter(function(req) {
                                if (req.status !== undefined) {
                                    if (req.status !== 404 && req.status.toString().match(/5\d\d|4\d\d/)) {
                                        if ($('.modal').length === 0) {
                                            console.log(req.responseText);

                                            swal({
                                                title: 'Application Error!',
                                                text: 'An error in the application has occured, if this problem persists please contact support: <a href="mailto:webgnome.help@noaa.gov">webgnome.help@noaa.gov</a><br /><br /><code>' + req.responseText + '</code>',
                                                type: 'error',
                                                confirmButtonText: 'Ok'
                                            });
                                        }
                                    }
                                }
                                return req.status === undefined;
                            });
                        }
                        else {
                            clearInterval(this.monitor);
                            this.monitor.interval = undefined;
                            this.monitor.start_time = moment().valueOf();
                        }

                        // check if we need to display a loading message.
                        if (moment().valueOf() - this.monitor.start_time > 300) {
                            if (_.isUndefined(this.monitor.loading)) {
                                this.monitor.loading = new LoadingView();
                            }
                        }
                        else {
                            if (!_.isUndefined(this.monitor.loading)) {
                                this.monitor.loading.close();
                                this.monitor.loading = undefined;
                            }
                        }
                    }, this), 500);
                }
            }, this));

            this.router = new Router();

            new SessionModel(function(){
                // check if there's an active model on the server
                // if there is attempt to load it and route to the map view.

                webgnome.cache = new Cache(null);
                var gnomeModel = new GnomeModel();
                window.webgnome.model = gnomeModel;
                gnomeModel.fetch({
                    success: function(model){
                        webgnome.user_prefs = new UserPrefs();
                        if(model.id){
                            webgnome.model.changed = {};
                            webgnome.model.addMapListeners();
                            webgnome.cache.rewind(true);
                            webgnome.model.isValid();
                        }
                        webgnome.styleCache = {};
                        webgnome.riskCalc = new RiskModel();
                        Backbone.history.start();
                    },
                    error: function(){
                        Backbone.history.start();
                        webgnome.router.navigate('', true);
                    },
                    silent: true
                });
            });

            //setup socket.io connection with server. This connection should be used throughout the program
            this.socketConnect();
        },

        socketConnect: function() {
            //console.log('Attaching logger socket routes...');
            console.log('Connecting to logger namespace');

            this.socket = io.io(
                this.config.socketio,
                {transports: ['polling', 'websocket'],
                 upgrade: true,
                 withCredentials: true,
                 reconnectionAttempts:10,
                }
            );

            this.socket.on('connect', function(msg) {console.log(msg);});
            this.socket.io.on('close', this.userSessionNotFound);
            this.socket.on('disconnect', function(msg) {console.log('DISCONNECT'); console.log(msg);});
            this.socket.io.on('error', function(msg) {console.log('ERROR'); console.log(msg);});
            this.socket.on('connect_error', function(msg) {console.log('CONNECT_ERROR'); console.log(msg);});
        },

        userSessionNotFound: function(msg) {
            if (msg === 'forced close'){
                swal({
                    title: 'Session Not Found',
                    text: ('Your session was unable to be found.\n' +
                           'Please refresh to receive a new session'),
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Refresh'
                }).then(_.bind(function(isConfirm) {
                    location.reload(true);
                }, this));
            } else {
                console.log(msg);
            }
        },

        sanitizeString(s){
            //Sanitizes an incoming string of all HTML escape characters
            return s.replace(/['"&]/gi, '_');
        },

        parseSanitize(response, parent){
            //response should be a JSON structure
            //Removes dangerous HTML from the body of the response
            var k, v, i, j;
            if (typeof response === 'string' || response instanceof String){
                //string case (end recursion)
                return this.sanitizeString(response);
            } else if (Array.isArray(response)){
                //array case
                for (j = 0; j < response.length; j++){
                    response[j] = this.parseSanitize(response[j], response);
                }
            } else {
                //object case
                var keys = _.keys(response);
                for (i = 0; i < keys.length; i++){
                    k = keys[i];
                    v = response[k];
                    if (v !== parent){
                        response[k] = this.parseSanitize(v, response);
                    }
                }
            }
            return response;
        },

        filenameSanitizeString(s) {
            return s.replace(/[^a-z0-9_-]/gi, '_');
        },

        largeNumberFormatter(dispValue) {
            if (typeof(dispValue) === 'string') {
                return dispValue;
            }
            else {
                if (dispValue < 1000) {
                    return Number(dispValue).toPrecision(4);
                } else if (dispValue < 10000000) {
                    return Number.parseInt(dispValue, 10);
                } else {
                    return Number(dispValue).toPrecision(4);
                }
            }
        },

        timeStringToSeconds: function(timeAttr) {
            // We would like to be consistent in how we represent time in
            // our model, and all other objects that implement a notion of
            // time.  So this is a method for parsing a string containing a
            // date/time value in UTF, and converting it to a numeric value
            // in seconds.  This should be  accessible to all objects through
            // webgnome.timeStringToSeconds()
            if (timeAttr === 'inf') {
                return Number.POSITIVE_INFINITY;
            }
            else if (timeAttr === '-inf') {
                return Number.NEGATIVE_INFINITY;
            }
            else {
                return moment(timeAttr, moment.ISO_8601).unix();
            }
        },

        secondsToTimeString: function(seconds) {
            // We would like to be consistent in how we represent time in
            // our model, and all other objects that implement a notion of
            // time.  So this is a method for formating a unix timestamp
            // (seconds since the epoch) into an ISO 8601 time string.
            if (seconds === Number.POSITIVE_INFINITY) {
                return 'inf';
            }
            else if (seconds === Number.NEGATIVE_INFINITY) {
                return '-inf';
            }
            else {
                return moment.unix(seconds).toISOString(true);  // keepOffset
            }
        },

        generateHalfHourTimesArray: function() {
            var times = [];

            for (var i = 0; i < 24; i++) {
                times.push(i + ":00");
                times.push(i + ":30");
            }

            return times;
        },

        // is it possible to move this config step out of the app?
        // maybe using inheritance w/ base view?
        configure: function() {
            // Use Django-style templates semantics with Underscore's _.template.
            _.templateSettings = {
                // {{ variable_name }} -- Escapes unsafe output (e.g. user
                // input) for security.
                escape: /\{\{(.+?)\}\}/g,

                // {{ variable_name }} -- Does not escape output.
                interpolate: /\{\{-(.+?)\}\}/g,

                // {{ javascript }}
                evaluate: /\{\%(.+?)\%\}/g
            };

            Backbone.View.prototype.close = function(){
                this.remove();
                this.unbind();
                if (this.onClose){
                    this.onClose();
                }
            };

            Backbone.Model.prototype.close = function(){
                this.clear();
                this.unbind();
                if (this.onClose){
                    this.onClose();
                }
            };

            /**
             * Convert the model's or collection's attributes into the format needed by
             * fancy tree for rendering in a view
             * @return {Object} formated json object for fancy tree
             */
            Backbone.Model.prototype.toTree = function(use_attrs){
                var attrs = _.clone(this.attributes);
                var tree = [];
                var children = [];

                if(_.isUndefined(use_attrs)){
                    use_attrs = true;
                }

                for(var key in attrs){
                    var el = attrs[key];
                    // flat attribute just set the index and value
                    // on the tree. Should map to the objects edit form.
                    if(!_.isObject(el) && use_attrs === true){

                        tree.push({title: key + ': ' + el, key: el,
                                   obj_type: attrs.obj_type, action: 'edit', object: this});

                    } else if (_.isObject(el) && !_.isArray(el) && !_.isUndefined(el.obj_type)) {
                        // child collection/array of children or single child object
                        if(_.has(el, 'toTree')){
                            children.push({title: key + ':', children: el.toTree(), expanded: true, obj_type: el.get('obj_type'), action: 'new'});
                        }
                    } else if (_.isArray(el)){
                        var arrayOfStrings = [];
                        for (var i = 0; i < el.length; i++){
                            var arrayString = '[' + el[i] + ']';
                            var arrayObj = {title: arrayString};
                            arrayOfStrings.push(arrayObj);
                        }
                        if (el.length > 0){
                            children.push({title: key + ': [...]', expanded: false, children: arrayOfStrings});
                        } else {
                            children.push({title: key + ': []'});
                        }
                    }
                }

                tree = tree.concat(children);
                return tree;
            };

            Backbone.Model.prototype.toDebugTree = function(){
                var attrs = _.clone(this.attributes);
                var tree = [];
                var children = [];

                for(var key in attrs){
                    var el = attrs[key];
                    // flat attribute just set the index and value
                    // on the tree. Should map to the objects edit form.
                    if(!_.isObject(el)){

                        tree.push({title: key + ': ' + el, key: el,
                                   obj_type: attrs.obj_type, action: 'edit', object: this});

                    } else if (_.isObject(el) && !_.isArray(el) && el.toDebugTree) {
                        // child collection/array of children or single child object
                        children.push({title: key + ':', children: el.toDebugTree(), expanded: true, obj_type: el.get('obj_type'), action: 'new'});
                    } else if (_.isArray(el)){
                        var arrayOfStrings = [];
                        for (var i = 0; i < el.length; i++){
                            var arrayString = '[' + el[i] + ']';
                            var arrayObj = {title: arrayString};
                            arrayOfStrings.push(arrayObj);
                        }
                        if (el.length > 0){
                            children.push({title: key + ': [...]', expanded: false, children: arrayOfStrings});
                        } else {
                            children.push({title: key + ': []'});
                        }
                    }
                }

                tree = tree.concat(children);
                return tree;
            };

            Backbone.Collection.prototype.toTree = function(name){
                var models = _.clone(this.models);
                var tree = [];

                for(var model in models){
                    var el = models[model];
                    tree.push({title: el.get('obj_type').split('.').pop(), children: el.toTree(), action: 'edit', object: el, expanded: true});
                }

                return tree;
            };

            Backbone.Collection.prototype.toDebugTree = function(){
                var models = _.clone(this.models);
                var tree = [];

                for(var model in models){
                    var el = models[model];
                    tree.push({title: el.get('obj_type').split('.').pop(), children: el.toDebugTree(), action: 'edit', object: el, expanded: true});
                }

                return tree;
            };

            // use this transport for "binary" data type
            $.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
                var callback,
                    xhrSuccessStatus = {
                        // file protocol always yields status code 0, assume 200
                        0: 200,
                        // Support: IE9
                        // #1450: sometimes IE returns 1223 when it should be 204
                        1223: 204
                    };
                // check for conditions and support for blob / arraybuffer response type
                if (window.FormData && ((options.dataType && (options.dataType === 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
                {
                    var xhrCallbacks = {},
                        xhrId=0;
                    return {
                        // create new XMLHttpRequest
                        send: function(headers, complete){
                            // setup all variables
                            var i,
                                xhr = options.xhr(),
                                id = ++xhrId;
                            xhr.open( options.type, options.url, options.async, options.username, options.password );
                            if ( options.xhrFields ) {
                                for ( i in options.xhrFields ) {
                                    xhr[ i ] = options.xhrFields[ i ];
                                }
                            }
                            // Override mime type if needed
                            if ( options.mimeType && xhr.overrideMimeType ) {
                                xhr.overrideMimeType( options.mimeType );
                            }

                            // X-Requested-With header
                            // For cross-domain requests, seeing as conditions for a preflight are
                            // akin to a jigsaw puzzle, we simply never set it to be sure.
                            // (it can always be set on a per-request basis or even using ajaxSetup)
                            // For same-domain requests, won't change header if already provided.
                            if ( !options.crossDomain && !headers["X-Requested-With"] ) {
                                headers["X-Requested-With"] = "XMLHttpRequest";
                            }

                            // Set headers
                            for ( i in headers ) {
                                xhr.setRequestHeader( i, headers[ i ] );
                            }

                            xhr.responseType = "arraybuffer";

                            // Callback
                            callback = function( type ) {
                                return function() {
                                    if ( callback ) {
                                        delete xhrCallbacks[ id ];
                                        callback = xhr.onload = xhr.onerror = null;

                                        if ( type === "abort" ) {
                                            xhr.abort();
                                        } else if ( type === "error" ) {
                                            complete(
                                                // file: protocol always yields status 0; see #8605, #14207
                                                xhr.status,
                                                xhr.statusText
                                            );
                                        } else {
                                            complete(
                                                xhrSuccessStatus[ xhr.status ] || xhr.status,
                                                xhr.statusText,
                                                // Support: IE9
                                                // Accessing binary-data responseText throws an exception
                                                // (#11426)
                                                {binary: xhr.response},
                                                xhr.getAllResponseHeaders()
                                            );
                                        }
                                    }
                                };
                            };

                            // Listen to events
                            xhr.onload = callback();
                            xhr.onerror = callback("error");

                            // Create the abort callback
                            callback = xhrCallbacks[ id ] = callback("abort");

                            try {
                                // Do send the request (this may raise an exception)
                                xhr.send( options.hasContent && options.data || null );
                            } catch ( e ) {
                                // #14683: Only rethrow if this hasn't been notified as an error yet
                                if ( callback ) {
                                    throw e;
                                }
                            }
                        },

                        abort: function() {
                            if ( callback ) {
                                callback();
                            }
                        }
                    };
                }
            });

        },

        capabilities: function(){
            var thisApp = this;

            $.get(this.config.api + '/uploaded')
            .done(function(result) {
                // We are just trying to figure out whether our API server
                // supports persistent uploads.  If we succeed here at all,
                // then persistent uploads are indeed supported
                thisApp.config.can_persist = true;
            })
            .fail(function() {
                thisApp.config.can_persist = false;
            });
        },

        getForm: function(obj_type){
            var map = {
                'gnome.model.Model': 'views/form/model',
                'gnome.maps.map.GnomeMap': 'views/form/map',
                'gnome.spill.spill.Spill': 'views/form/spill',
                'gnome.spill.release.PointLineRelease': 'views/form/spill',
                'gnome.environment.wind.Wind': 'views/form/wind',
                'gnome.movers.random_movers.RandomMover': 'views/form/random',
                'gnome.movers.wind_movers.WindMover': 'views/form/windMover',
                'gnome.movers.current_movers.CatsMover': 'views/form/cats'
            };

            return map[obj_type];
        },

        hasModel: function(){
            if(_.has(webgnome, 'model') && !_.isUndefined(webgnome.model) && _.isObject(webgnome.model) && !_.isUndefined(webgnome.model.get('id'))){
                return true;
            }
            return false;
        },

        getConfig: function() {
            var config_obj = JSON.parse(config);

            // if there isn't a domain provided just use the
            // one the client was served on.
            var domain = location.href.split(':');
            domain.pop();
            domain = domain.join(':') + ':';

            if (config_obj.api.match(/^\d*$/)) {
                config_obj.api = domain + config_obj.api;
            }

            if (!_.has(config_obj, 'socketio')){
                config_obj.socketio = config_obj.api;
            }

            if(config_obj.oil_api.match(/^\d*$/)) {
                config_obj.oil_api = domain + config_obj.oil_api;
            }

            if (typeof(config_obj.session_timeout) === 'string') {
                /*jshint -W061 */  // eval is evil warning
                config_obj.session_timeout = eval(config_obj.session_timeout);
            }

            if (typeof(config_obj.afk_timeout) === 'string') {
                /*jshint -W061 */  // eval is evil warning
                config_obj.afk_timeout = eval(config_obj.afk_timeout);
            }

            return config_obj;
        },

        validModel: function() {
            if (webgnome.hasModel()) {
                if (webgnome.model.isValid() &&
                        webgnome.model.get('outputters').length > 0 &&
                        webgnome.model.get('spills').length > 0) {
                    return true;
                }
            }

            return false;
        },

        invokeSaveAsDialog: function(file, fileName) {
            if (!file) {
                throw 'Blob object is required.';
            }

            if (!file.type) {
                try {
                    file.type = 'video/webm';
                } catch (e) {}
            }

            var fileExtension = (file.type || 'video/webm').split('/')[1];

            if (fileName && fileName.indexOf('.') !== -1) {
                var splitted = fileName.split('.');
                fileName = splitted[0];
                fileExtension = splitted[1];
            }

            var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

            if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
                return navigator.msSaveOrOpenBlob(file, fileFullName);
            }
            else if (typeof navigator.msSaveBlob !== 'undefined') {
                return navigator.msSaveBlob(file, fileFullName);
            }

            var hyperlink = document.createElement('a');
            hyperlink.href = URL.createObjectURL(file);
            hyperlink.download = fileFullName;

            hyperlink.style = 'display:none;opacity:0;color:transparent;';
            (document.body || document.documentElement).appendChild(hyperlink);

            if (typeof hyperlink.click === 'function') {
                hyperlink.click();
            } else {
                hyperlink.target = '_blank';
                hyperlink.dispatchEvent(new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                }));
            }

            URL.revokeObjectURL(hyperlink.href);
        },

        initSessionTimer: function(func) {
            if (typeof(Worker) !== "undefined") {
                // Yes! Web worker support!
                if (typeof(webgnome.timer) === "undefined") {
                    webgnome.idleTime = 0;
                    webgnome.timer = new Worker("js/session_timer.js");
                    webgnome.timer.onmessage = func;

                    window.addEventListener("mousemove", this.zeroSessionTime);
                    window.addEventListener("keydown", this.zeroSessionTime);
                }
            }
            else {
              console.warning('Sorry, web workers not supported!');
            }
        },

        resetSessionTimer: function() {
            if (typeof(Worker) !== "undefined") {
                // Yes! Web worker support!
                if (typeof(webgnome.timer) !== "undefined") {
                    webgnome.lastActivity = moment().unix();
                    webgnome.timer.terminate();
                    webgnome.timer = undefined;

                    window.removeEventListener("mousemove", this.zeroSessionTime);
                    window.removeEventListener("keydown", this.zeroSessionTime);
                }
            }
            else {
              console.warning('Sorry, web workers not supported!');
            }
        },

        zeroSessionTime: function() {
            // we will track the datetime of the last detected activity
            webgnome.lastActivity = moment().unix();
        },

        continueSession: function(event) {
            var idleTime = (moment().unix() - webgnome.lastActivity) / 60;

            if (idleTime >= webgnome.config.afk_timeout) {
                swal.close();
                webgnome.sessionSWAL = false;

                webgnome.resetSessionTimer();
                webgnome.loseModelSession();
            }
            else if (idleTime >= webgnome.config.session_timeout) {
                // We will keep responding to timer ticks, but  we only want to
                // pop up our alert one time,
                if (_.isUndefined(webgnome.sessionSWAL) ||
                        webgnome.sessionSWAL === false) {
                    webgnome.sessionSWAL = true;

                    swal({
                        title: 'Session Timed Out',
                        text: ('Your session has been inactive for more than ' +
                               '1 hour.\n' +
                               'The model setup will be automatically deleted\n' +
                               'after 72 hours of no activity.\n' +
                               'Would you like to continue working with this setup?'),
                        type: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'Start Over',
                        confirmButtonText: 'Continue Previous',
                        reverseButtons: true
                    }).then(_.bind(function(isConfirm) {
                        webgnome.sessionSWAL = false;

                        if (isConfirm) {
                            // start the timer again
                            webgnome.initSessionTimer(webgnome.continueSession);
                        }
                        else {
                            webgnome.loseModelSession();
                        }
                    }, this));
                }
            }
        },

        loseModelSession: function() {
            localStorage.setItem('prediction', null);

            if (!_.isUndefined(webgnome.riskCalc)) {
                webgnome.riskCalc.destroy();
            }

            webgnome.riskCalc = undefined;

            if (_.has(webgnome, 'cache')) {
                webgnome.cache.rewind();
                webgnome.router._cleanup();
            }

            // This is from views/defaults/menu.js
            // Not sure if we really need this.
            //this.contextualize();

            webgnome.model = new GnomeModel({
                mode: 'gnome',
                name: 'Model',
            });

            webgnome.router.navigate('', true);
        }
    };

    return app;
});
