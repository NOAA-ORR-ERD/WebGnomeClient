// basic controller to configure and setup the app
define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'moment',
    'sweetalert',
    'text!../config.json',
    'model/session',
    'model/gnome',
    'model/risk/risk',
    'views/default/loading',
], function($, _, Backbone, Router, moment, swal, config, SessionModel, GnomeModel, RiskModel, LoadingView) {
    'use strict';
    var app = {
        obj_ref: {},
        initialize: function(){
            // Ask jQuery to add a cache-buster to AJAX requests, so that
            // IE's aggressive caching doesn't break everything.
            $.ajaxSetup({
                xhrFields: {
                    withCredentials: true
                }
            });

            this.config = this.getConfig();
            this.configure();

            this.config.date_format.half_hour_times = this.generateHalfHourTimesArray();
            this.config.date_format.time_step = 30;

            this.monitor = {};
            this.monitor.requests = [];

            $.ajaxPrefilter(_.bind(function(options, originalOptions, jqxhr){
                if(options.url.indexOf('http://') === -1 && options.url.indexOf('https://') === -1){
                    options.url = webgnome.config.api + options.url;
                    // add a little cache busting so IE doesn't cache everything...
                    options.url += '?' + (Math.random()*10000000000000000);
                } else {
                    // if this request is going somewhere other than the webgnome api we shouldn't enforce credentials.
                    delete options.xhrFields.withCredentials;
                }

                // monitor interation to check the status of active ajax calls.
                this.monitor.requests.push(jqxhr);

                if(_.isUndefined(this.monitor.interval)){
                    this.monitor.start_time = moment().valueOf();
                    this.monitor.interval = setInterval(_.bind(function(){
                        var loading;
                        if(this.monitor.requests.length > 0){
                            this.monitor.requests = this.monitor.requests.filter(function(req){
                                if(req.status !== undefined){
                                    if(req.status !== 404 && req.status.toString().match(/5\d\d|4\d\d/)){
                                        if($('.modal').length === 0){
                                            swal({
                                                html: true,
                                                title: 'Application Error!',
                                                text: 'An error in the application has occured, if this problem persists please contact support.<br /><br /><code>' + req.responseText + '</code>',
                                                type: 'error',
                                                confirmButtonText: 'Ok'
                                            }, function(isConfirm){
                                            });
                                        }
                                    }
                                }
                                return req.status === undefined;
                            });
                        } else {
                            clearInterval(this.monitor);
                            this.monitor.interval = undefined;
                            this.monitor.start_time = moment().valueOf();
                        }

                        // check if we need to display a loading message.
                        if(moment().valueOf() - this.monitor.start_time > 300){
                            if(_.isUndefined(this.monitor.loading)){
                                this.monitor.loading = new LoadingView();
                            }
                        } else {
                            if(!_.isUndefined(this.monitor.loading)){
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
                
                var gnomeModel = new GnomeModel();
                gnomeModel.fetch({
                    success: function(model){
                        if(model.id){
                            window.webgnome.model = model;
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
        configure: function(){
            // Use Django-style templates semantics with Underscore's _.template.
            _.templateSettings = {
                // {{- variable_name }} -- Escapes unsafe output (e.g. user
                // input) for security.
                escape: /\{\{-(.+?)\}\}/g,

                // {{ variable_name }} -- Does not escape output.
                interpolate: /\{\{(.+?)\}\}/g,

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
        },

        getForm: function(obj_type){
            var map = {
                'gnome.model.Model': 'views/form/model',
                'gnome.map.GnomeMap': 'views/form/map',
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

        getConfig: function(){
            return  JSON.parse(config);
        },
        
        validModel: function(){
            if(webgnome.hasModel()){
                if(webgnome.model.isValid() && webgnome.model.get('outputters').length > 0 && webgnome.model.get('spills').length > 0){
                    return true;
                }
            }
            return false;
        }
    };

    return app;
});
