// basic controller to configure and setup the app
define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'model/session',
    'model/gnome'
], function($, _, Backbone, Router, SessionModel, GnomeModel) {
    "use strict";
    var app = {
        api: 'http://0.0.0.0:9899',
        // api: 'http://hazweb2.orr.noaa.gov:7450',
        initialize: function(){
            // Ask jQuery to add a cache-buster to AJAX requests, so that
            // IE's aggressive caching doesn't break everything.
            $.ajaxSetup({
                xhrFields: {
                    withCredentials: true
                }
            });

            // Filter json requestions to redirect them to the api server
            $.ajaxPrefilter('json', function(options){
                if(options.url.indexOf('http://') === -1){
                    options.url = webgnome.api + options.url;
                }
            });

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

            Backbone.Model.prototype.parse = function(response){
                // special parse that will recursively build an array of data
                // into it's associated colloction and data object
                // or just into it's data object if it's not an array.
                for(var key in this.model){
                    if(response[key]){
                        if(_.isArray(response[key])){
                            // parse a model array into a collection
                            var embeddedClass = this.model[key];
                            var embeddedData = response[key];
                            response[key] = new Backbone.Collection();
                            for(var i = 0; i > embeddedData.length; i++){
                                response[key].add(new embeddedClass[i](embeddedData[i], {parse:true}));
                            }
                        } else {
                            // parse a object noted as a child into it's appropriate backbone model
                            var embeddedClass = this.model[key];
                            var embeddedData = response[key];
                            response[key] = new embeddedClass(embeddedData, {parse:true});
                        }
                    }
                }
                return response;
            };

            /**
             * Convert the model's or collection's attributes into the format needed by
             * fancy tree for rendering in a view
             * @return {Object} formated json object for fancy tree
             */
            Backbone.Collection.prototype.toTree = Backbone.Model.prototype.toTree = function(name){
                var attrs = _.clone(this.attributes);
                var tree = [];
                var children = [];

                if(_.isUndefined(name)){
                    name = 'Model';
                }

                for(var key in attrs){
                    var el = attrs[key];
                    if(!_.isObject(el)){
                        // flat attribute just set the index and value
                        // on the tree. Should map to the objects edit form.
                        tree.push({title:key + ': ' + el, key: el, obj_type: attrs.obj_type, action: 'edit', object: this});
                    } else if(!_.isArray(el)) {
                        // child collection/array of children or single child object
                        children.push({title: key + ':', children: el.toTree(), expanded: true, obj_type: el.get('obj_type'), action: 'new'});
                    }
                }
                tree = tree.concat(children);
                return tree;
            };

            webgnome.getForm = function(obj_type){
                var map = {
                    'gnome.model.Model': 'views/form/model',
                    'gnome.map.GnomeMap': 'views/form/map',
                    'gnome.spill.Spill': 'views/form/spill',
                };

                return map[obj_type];
            };

            this.router = new Router();

            new SessionModel(function(){
                // check if there's an active model on the server
                // if there is attempt to load it and route to the map view.
                var gnomeModel = new GnomeModel();
                gnomeModel.fetch({
                    success: function(model){
                        if(model.id){
                            window.webgnome.model = model;
                        }
                        Backbone.history.start();
                        webgnome.router.navigate('model', true);
                    },
                    error: function(){
                        Backbone.history.start();
                    }
                });


            });
        },
        hasModel: function(){
            return false;
        },
        
        validModel: function(){
            return false;
        }
    };

    return app;
});