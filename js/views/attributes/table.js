define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/attributes/row.html'
], function($, _, Backbone, RowTemplate){
    var attributesTable = Backbone.View.extend({
        tagName: 'table',
        className: 'table table-condensed table-striped',

        events: {
            'change input': 'update'
        },

        initialize: function(options){
            if(!_.has(options, 'model')) return null;
            this.model = options.model;
            this.render();

        },

        render: function(){
            if(this.title){
                this.$el.append('<h4>' + this.title + '</h4>');
            }

            for(var attr in this.model.attributes){
                var value = this.model.attributes[attr];
                this.$el.append(_.template(RowTemplate, {name: attr, value: value}));
            }
        },

        update: function(e){
            var attribute = $(e.currentTarget).data('attribute');
            var value = $(e.currentTarget).val();
            this.model.set(attribute, value, {silent: true});
        }
    });
    return attributesTable;
});