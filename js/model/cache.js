define([
    'jquery',
    'underscore',
    'backbone',
    'model/step'
], function($, _, Backbone, StepModel){
    var cache = Backbone.Collection.extend({
        models: new Backbone.Collection(),

        initialize: function(options){
            this.rewind();
            this.gnome_model = options.gnome_model;
            this.gnome_model.on('change', _.bind(this.checkState, this));
        },

        checkState: function(){
            if(this.gnome_model.hasChanged){
                this.rewind();
            }
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
            $.get(webgnome.config.api + '/rewind');
            this.reset([]);
        }
    });

    return cache;
});