define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/base',
    'module',
    'model/visualization/appearance',
    'd3',
    'text!templates/form/visualization/appearance.html'
], function ($, _, Backbone, BaseForm, module, Appearance, DDD, AppearanceFormTemplate) {
    "use strict";
    var appearanceForm = BaseForm.extend({

        events: {
            'change .appearance-edit input': 'update',
        },

        initialize: function(model) {
            this.model = model;
            this.addListeners();
            this.render();
            DDD.scaleLinear();
        },

        addListeners: function() {
            
        },

        render() {
            var html = $('<form></form>',{ 'class': 'form-horizontal appearance-edit', 'role': 'form', 'id': this.model.get('id')});
            var attrNames = _.keys(this.model.get('ctrl_names'));
            var ctrlNames = _.values(this.model.get('ctrl_names'));
            var attrValues = _.values(this.model.attributes);
            this.$el.html(_.template( AppearanceFormTemplate,
                {
                model: this.model,
                attrNames: attrNames,
                ctrlNames: ctrlNames,
                }
            ));
        },

        update: function(e){
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
            if(!name){ return; }
            // if the user is inputting a negative numerical value
            // reset it back to the non-neg version.
            if(value < 0 || value === '-'){
                var nonneg = value.replace('-', '');
                $(e.target).val(parseFloat(nonneg));
                value = nonneg;
            }

            if($(e.target).attr('type') === 'number'){
                value = parseFloat(value);
            }

            if($(e.target).attr('type') === 'checkbox'){
                value = e.currentTarget.checked;
            }

            var type = $(e.target).data('type');
            if(type){
                if(type === 'array'){
                    value = value.split(','); 
                }
            }

            name = name.split(':');
            if(name.length === 1){
                this.model.set(name[0], value);
            } else {
                this.model.get(name[0]).set(name[1], value);
            }
        },

    });
    return appearanceForm;
});