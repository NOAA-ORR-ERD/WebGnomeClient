define([
    'jquery',
    'underscore',
    'backbone',
    'model/step'
], function($, _, Backbone, StepModel){
    var cache = Backbone.Collection.extend({

        initialize: function(options, model){
            this.rewind();
            this.gnome_model = model;
            this.gnome_model.on('sync', _.bind(this.checkState, this));
            $.get(webgnome.config.api + '/rewind');
        },

        checkState: function(){
            this.rewind();
        },

        step: function(){
            var step = new StepModel();
            this.trigger('step:sent');
            step.fetch({
                success: _.bind(function(step){
                    this.add(step);
                    this.trigger('step:recieved', step);
                }, this),
                error: _.bind(function(){
                    this.trigger('step:failed');
                }, this)
            });
        },

        rewind: function(){
            if(this.length > 0){
                $.get(webgnome.config.api + '/rewind');
                this.reset([]);
            }
        }
    });

    return cache;
});