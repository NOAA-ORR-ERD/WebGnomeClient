define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/visualization/appearance',
    'module',
    'model/visualization/appearance',
    'views/form/visualization/colormap',
    'd3',
    'text!templates/form/visualization/spill_appearance.html'
], function ($, _, Backbone, BaseAppearanceForm, module, Appearance, ColormapForm, DDD, SpillAppearanceTemplate) {
    "use strict";
    var spillAppearanceForm = BaseAppearanceForm.extend({

        events: {
            'change .appearance-edit input': 'update',
            'change .appearance-edit select': 'update',
            'change .datavis-config input': 'update',
            'change .datavis-config select': 'update',
            //'change .datavis-config input': 'updateCfg'
        },


        initialize: function(model, spill) {
            this.model = model;
            this.spill = spill;
            this.addListeners();
            this.render();
        },

        addListeners: function() {
            
        },

        render: function() {
            BaseAppearanceForm.prototype.render.call(this);
            if (this.model.get('data')){
                this.$el.append(_.template(SpillAppearanceTemplate, 
                    {
                    titles: this.model.get('_available_data'),
                    model: this.model,
                    colormap: this.model.get('colormap')
                    }
                ));
                var colormapForm = new ColormapForm(this.model.get('colormap'), this.model);
                colormapForm.$el.appendTo(this.$el);
            }
        },

        updateCfg: function(e) {
            var name = this.$(e.currentTarget).attr('name');
            if (!name) {
                this.model.trigger('change', this.model);
                return;
            }
            var value = this.$(e.currentTarget).val();
            if($(e.target).attr('type') === 'number'){
                value = parseFloat(value);
            }

            if($(e.target).attr('type') === 'checkbox'){
                value = e.currentTarget.checked;
            }

            name = name.split(':');
            var curobj = this.model.get('datavis_configs');
            for (var i = 0; i < name.length-1; i++) {
                curobj = curobj[name[i]];
            }
            curobj[name[i]] = value;
            this.model.trigger('change', this.model);
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
    return spillAppearanceForm;
});