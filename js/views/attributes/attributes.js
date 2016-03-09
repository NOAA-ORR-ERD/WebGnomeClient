define([
    'jquery',
    'underscore',
    'backbone',
    'views/attributes/table',
    'text!templates/attributes/panel.html'
], function($, _, Backbone, AttributesTable, PanelTemplate){
    'use strict';
    var attributesView = Backbone.View.extend({
        className: 'attributes',

        events: {
            'click .expand': 'expand'
        },

        initialize: function(options){
            if(!_.has(options, 'model')) return null;
            this.model = options.model;

            this.render();
        },

        render: function(){
            if(this.model){
                this.$el.append(_.template(PanelTemplate, {
                    title: this.model.get('obj_type') ? this.model.get('obj_type') : '',
                }));
                this.$('.panel-body').append(new AttributesTable({model: this.model}).$el);

                var submodels = _.keys(this.model.model);
                for(var key in submodels){
                    this.$('.panel-body:first').append(new attributesView({model: this.model.get(submodels[key])}).$el);
                }
            }
        },

        expand: function(e){
            this.$(e.currentTarget).parents('.attributes:first').find('.collapse:first').collapse('toggle');
        }
    });
    return attributesView;
});