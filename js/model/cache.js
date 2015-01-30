define([
    'jquery',
    'underscore',
    'backbone',
    'model/step'
], function($, _, Backbone, StepModel){
    var cache = Backbone.Collection.extend({
        models: new Backbone.Collection(),

        initialize: function(){
            this.rewind();
            webgnome.model.on('change', _.bind(this.checkState, this));
        },

        checkState: function(){
            if(webgnome.model.hasChanged){
                this.rewind();
            }
        },

        step: function(cb){
            var step = new StepModel();
            step.fetch({
                success: _.bind(function(step){
                    this.add(step);
                    cb.success(step);
                }, this),
                error: cb.error
            });
        },

        rewind: function(){
            $.get(webgnome.config.api + '/rewind');
            this.reset([]);
        }
    });

    return cache;
});