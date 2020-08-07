define([
    'jquery',
    'underscore',
    'views/form/visualization/appearance',
    'views/form/visualization/colormap',
    'text!templates/form/visualization/spill_appearance.html'
], function ($, _, BaseAppearanceForm, ColormapForm,
             SpillAppearanceTemplate) {
    "use strict";

    var spillAppearanceForm = BaseAppearanceForm.extend({
        events: {
            'change .appearance-edit input': 'update',
            'change .appearance-edit select': 'update',
            'change .datavis-config input': 'update',
            'change .datavis-config select': 'update',
            'change .presets select': 'applyPresetScale',
            //'change .datavis-config input': 'updateCfg'
        },

        initialize: function(model, spill) {
            this.model = model;
            this.spill = spill;
            this.colormapModel = this.model.get('colormap');

            this.addListeners();
            this.model.setUnitConversionFunction(undefined,
                                                 this.model.get('units'));
            this.render();
        },

        addListeners: function() {
            this.listenTo(this.model, 'change:data', this.rerender);
            this.listenTo(this.model, 'changedMapType', this.rerender);
            this.listenTo(this.colormapModel, 'change', _.bind(function(){this.spill.updateVis(this.model);}, this));
        },

        render: function() {
            BaseAppearanceForm.prototype.render.call(this);

            var presets = _.filter(this.model.get('preset_scales'), _.bind(function(p){return p.data === this.get('data');}, this.model));

            var html = _.template(SpillAppearanceTemplate, 
                            {titles: this.model.get('_available_data'),
                             presets: presets,
                             model: this.model,
                             colormap: this.model.get('colormap')
                             }
            );

            this.$el.append(html);

            this.colormapForm = new ColormapForm(this.model.get('colormap'),
                                                 this.model);
            //this.$el.append(this.colormapForm.el.innerHTML);
            this.colormapForm.$el.appendTo(this.$el);
        },

        rerender: function() {
            this.colormapForm.remove();
            delete this.colormapForm;
            this.$el.html('');
            this.render();
        },

        applyPresetScale: function(e) {
            console.log(e);
            var value = this.$(e.currentTarget).val();
            var data = this.model.get('data');
            var scale = _.findWhere(this.model.get('preset_scales'), {name: value, data: data});
            var colormap = this.model.get('colormap');
            var newColormap = scale.colormap;
            colormap.set(scale.colormap, {silent:true});
            this.model.set('units', scale.units);
            this.model.save();
            colormap.trigger('change');
            this.rerender();
        },

        updateCfg: function(e) {
            var name = this.$(e.currentTarget).attr('name');

            if (!name) {
                this.model.trigger('change', this.model);
                return;
            }

            var value = this.$(e.currentTarget).val();

            if ($(e.target).attr('type') === 'number') {
                value = parseFloat(value);
            }

            if ($(e.target).attr('type') === 'checkbox') {
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

        update: function(e) {
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();

            if (!name) { return; }

            // if the user is inputting a negative numerical value
            // reset it back to the non-neg version.
            if (value < 0 || value === '-') {
                var nonneg = value.replace('-', '');

                $(e.target).val(parseFloat(nonneg));

                value = nonneg;
            }

            if ($(e.target).attr('type') === 'number') {
                value = parseFloat(value);
            }

            if ($(e.target).attr('type') === 'checkbox') {
                value = e.currentTarget.checked;
            }

            var type = $(e.target).data('type');
            if (type) {
                if (type === 'array') {
                    value = value.split(','); 
                }
            }

            name = name.split(':');
            if (name.length === 1) {
                this.model.set(name[0], value);
            }
            else {
                this.model.get(name[0]).set(name[1], value);
            }
        }
    });

    return spillAppearanceForm;
});
