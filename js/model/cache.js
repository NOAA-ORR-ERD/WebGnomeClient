define([
    'jquery',
    'underscore',
    'backbone',
    'localforage',
    'model/step'
], function($, _, Backbone, localforage, StepModel){
    var cache = Backbone.Collection.extend({
        fetching: false,

        initialize: function(options, model){
            this.gnome_model = model;
            this.gnome_model.on('sync', _.bind(this.checkState, this));
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
            if (!this.fetching) {
                this.fetching = true;
                step.fetch({
                    success: _.bind(function(step){
                        this.add(step);
                        this.fetching = false;
                        this.trigger('step:recieved', step);
                    }, this),
                    error: _.bind(function(){
                        this.fetching = false;
                        this.trigger('step:failed');
                    }, this)
                });
            }
        },

        rewind: function(override){
            if(this.length > 0 || override){
                $.get(webgnome.config.api + '/rewind');
                this.trigger('rewind');
                this.reset();
            }
        },

        add: function(models, options){
            var key;
            if(_.isArray(models)){
                for(var m = 0; m < models.length; m++){
                    key = this.length + 1;
                    localforage.setItem(key.toString(), models[m]);
                    this.length++;
                }
            } else {
                key = this.length + 1;
                localforage.setItem(key.toString(), models);
                this.length++;
            }
        },

        at: function(index){
            return localforage.getItem(index);
        },

        reset: function(){
            localforage.clear();
        }
    });

    return cache;
});