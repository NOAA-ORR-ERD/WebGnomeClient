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
            'change input, select': 'update',
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
                    if (type === 'array'){
                        value = JSON.stringify(value).split(',').join(', ');
                    } else {
                        value = _.escape(value);
                    }
                    
                    var tmpl = _.template(RowTemplate);
                    this.$el.append(tmpl({name: attr, value: value, type: type}));
                }
            }
        },

        update: function(e){
            var attrName = e.currentTarget.getAttribute('data-attribute');
            var modelVal = this.model.attributes[attrName];
            var attrType = 'text';
            if(_.isNumber(modelVal)){
                attrType = 'number';
            } else if (_.isBoolean(modelVal)){
                attrType = 'boolean';
            } else if(_.isArray(modelVal)){
                attrType = 'array';
            }

            var value = this.$(e.currentTarget).val();
            try {
                if (attrType === 'number') {
                    value = parseFloat(value);
                } else if (attrType === 'array') {
                    value = JSON.parse(value);
                } else if (attrType === 'boolean') {
                    value = JSON.parse(value);
                }
            } catch (err){
                this.$(e.currentTarget).css('background-color', 'lightpink');
            }
            this.$(e.currentTarget).css('background-color', 'white');
            this.model.set(attrName, value);
        }
    });
    return attributesTable;
});