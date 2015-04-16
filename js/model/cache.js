define([
    'jquery',
    'underscore',
    'backbone',
    'model/step'
], function($, _, Backbone, StepModel){
    var cache = Backbone.Collection.extend({
        fetching: false,

        initialize: function(options, model){
            this.gnome_model = model;
            this.gnome_model.on('sync', _.bind(this.checkState, this));
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
                this.reset([]);
            }
        }
    });

    return cache;
});