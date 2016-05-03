define([
    'jquery',
    'underscore',
    'backbone',
    'localforage',
    'model/step'
], function($, _, Backbone, localforage, StepModel){
    'use strict';
    var cache = Backbone.Collection.extend({
        fetching: false,
        inline: [],

        initialize: function(options, model){
            this.gnome_model = model;
            // this.gnome_model.on('sync', _.bind(this.checkState, this));
            localforage.config({
                name: 'WebGNOME Cache',
                storeName: 'webgnome_cache'
            });
        },

        checkState: function(){
            this.rewind();
        },

        step: function(){
            var step = new StepModel();
            this.trigger('step:sent');
            this.fetching = true;
            step.fetch({
                success: _.bind(function(step){
                    this.inline.push(step);
                    this.fetching = false;
                    this.length++;
                    this.trigger('step:recieved', step);
                }, this),
                error: _.bind(function(){
                    this.fetching = false;
                    this.trigger('step:failed');
                }, this)
            });
        },

        rewind: function(override){
            if(this.length > 0 || override === true){
                $.get('/rewind', _.bind(function(){
                    this.trigger('rewind');
                    this.reset();
                }, this));
            }
        },

        add: function(models, options){
            var key;
            if(_.isArray(models)){
                for(var m = 0; m < models.length; m++){
                    key = this.length;
                    if(m === models.length - 1){
                       localforage.setItem(key.toString(), models[m].attributes, options.success);
                    } else {
                        localforage.setItem(key.toString(), models[m].attributes);
                    }
                    this.length++;
                }
            } else {
                key = this.length;
                localforage.setItem(key.toString(), models.attributes, options.success);
                this.length++;
            }
        },

        at: function(index, cb){
            if(this.length > index && index >= 0){
                return cb(false, this.inline[index]);
            }
        },

        reset: function(){
            this.length = 0;
            localforage.clear();
            this.trigger('reset');
        }
    });

    return cache;
});