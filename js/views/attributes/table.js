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
            'change input,select': 'update',
        },

        initialize: function(options){
            if(!_.has(options, 'model')){ return null; }
            this.model = options.model;
            this.render();

        },

        render: function(){
            var ignore = [
                'obj_type',
                'id',
                'map',
                'outputter',
                'spills',
                'weatherers',
                'environment',
                'json_', 
                'outputters',
                'movers'
            ];
            if(this.title){
                this.$el.append('<h4>' + this.title + '</h4>');
            }

            for(var attr in this.model.attributes){
                if(ignore.indexOf(attr) === -1 &&
                    !_.isObject(this.model.attributes[attr]) ||
                    ignore.indexOf(attr) === -1 &&
                    _.isArray(this.model.attributes[attr])){

                    var type = 'text';
                    var value = this.model.attributes[attr];
                    if(_.isNumber(value)){
                        type = 'number';
                    } else if (_.isBoolean(value)){
                        type = 'boolean';
                    } else if(_.isArray(value)){
                        type = 'array';
                    }
                    value = _.escape(JSON.stringify(value));
                    
                    var tmpl = _.template(RowTemplate);
                    this.$el.append(tmpl({name: attr, value: value, type: type}));
                }
            }
        },

        update: function(e){
            var attribute = this.$(e.currentTarget).data('attribute');
            var value;
            try {
                value = JSON.parse(this.$(e.currentTarget).val());
            } catch (err){}
            try{
                if (_.isUndefined(value)){
                    value = this.$(e.currentTarget).val();
                }
                this.$(e.currentTarget).css('background-color', 'white');
                var type = this.$(e.currentTarget).attr('type');
                this.model.set(attribute, value, {silent: true});
            } catch (err){
                this.$(e.currentTarget).css('background-color', 'lightpink');
            }
        }
    });
    return attributesTable;
});