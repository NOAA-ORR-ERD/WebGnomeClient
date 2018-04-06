define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/visualization/appearance',
    'module',
    'model/visualization/appearance',
    'views/form/visualization/colormap',
    'd3',
    'json!model/visualization/defaultSpillAppearances.json',
    'text!templates/form/visualization/spillAppearance.html'
], function ($, _, Backbone, BaseAppearanceForm, module, Appearance, ColormapForm, DDD, defaultSA, SpillAppearanceTemplate) {
    "use strict";
    var spillAppearanceForm = BaseAppearanceForm.extend({

        events: {
            'change .appearance-edit input': 'update',
            'change .appearance-edit select': 'update',
            'change .datavis-config input': 'updateCfg'
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
                var config = this.model.get('datavis_configs')[this.model.get('data')];
                this.$el.append(_.template(SpillAppearanceTemplate, 
                    {
                    titles: _.keys(this.model.get('datavis_configs')),
                    colorMapTypes: _.keys(config.colorMaps),
                    config: config
                    }
                ));
                var colormapForm = new ColormapForm(config, this.model);
                colormapForm.$el.appendTo(this.$el);
            }
        },

        genDataPicker: function() {
            var row = $('<div></div>', {class: 'form-row'});
            var group = $('<div></div>', {class: 'form-group'});
            var ctrl = $('<div></div>', {class: 'col-sm-3'});
            var config;
            if (this.model.get('datavis')){
                config = this.model.get('datavis');
            } else {
                config = defaultSA[this.model.get('data')];
                this.model.set('datavis', config);
            }
            var datatype_dropdown = $('<select></select>', {class: 'form-control form-control-sm', name: 'data'});
            var opts = _.values(defaultSA).map(
                function(v){
                    var opt = $('<option></option>',{name:'data'}).text(v.title);
                    if (v.title === config.title) {
                        opt.prop('selected', true);
                    }
                    return opt
                }
            );
            opts.forEach(function(v){this.append(v)}, datatype_dropdown);
            var label = $('<label></label>', {class: "col-sm-3 control-label", 'for': 'data'}).text("Data source");
            ctrl.append(datatype_dropdown);
            group.append(label);
            group.append(ctrl);
            row.append(group);
            return row;
        },

        genDataControls: function(config) {
            var rows = [];
            var row = $('<div></div>', {class: 'form-row'});
            rows.push(row);
            var group = $('<div></div>', {class: 'form-group datavis-config'});
            row.append(group);
            group.append($('<label></label>', {class: 'control-label col-sm-3'}).text('Colormap Type'));
            config.colorMapType.forEach(
                function(t, i) {
                    var btn = $('<label></label>', {class: 'radio-inline col-sm-2'})
                                .append($('<input></input>', {type: 'radio', name: '_chosenColorMapType', value: t}))
                                .append(t);
                    if(!config._chosenColorMapType) {
                        config._chosenColorMapType = t
                    }
                    if (config._chosenColorMapType === t) {
                        btn.click();
                    }
                    group.append(btn)
                }
            );
            var useAlphaCheckbox = $('<label></label>', {class: 'checkbox-inline col-sm-3'})
                                    .append($('<input></input>', {type: 'checkbox', name: 'useAlpha', checked: config.useAlpha}))
                                    .append("Fade by Mass");
            group.append(useAlphaCheckbox);
            var useAlphaCheckbox = $("input", useAlphaCheckbox);
            if (config._chosenColorMapType === 'Alpha') {
                useAlphaCheckbox.prop('disabled', true);
            }
            if (config.title === 'Mass') {
                rows.push(this.genMassControls(config, rows));
            }
            return rows;
        },

        genMassControls: function(config, rows) {
            if (config._chosenColorMapType === 'Alpha') {
                var certrow = $('<div></div>', {class: 'form-row'});
                var group = $('<div></div>', {class: 'form-group datavis-config'});
                certrow.append(group);
                group.append($('<label></label>', {class: 'control-label col-sm-3', for:"colors"}).text('LE Color'));
                var ctrl = $('<div></div>', {class:'col-sm-3'});
                //Only one color is available to pick. The number scale maximum is set to max LE mass
                ctrl.append($('<input>', {type: "color", class: "form-control", name: "colors", value: config.colors[0]}));
                group.append(ctrl);
                rows.push(certrow);

                var uncertrow = certrow.clone();
                $('input[name="colors"]', uncertrow).attr({'name': 'uncertain_colors','value': config.uncertain_colors[0]});
                $('label[for="colors"]', uncertrow).attr('for', 'uncertain_colors').text('Uncertain LE Color');
                rows.push(uncertrow);
            }
            if (config._chosenColorMapType === 'Diverging') {
                var certrow = $('<div></div>', {class: 'form-row'});
                var group = $('<div></div>', {class: 'form-group datavis-config'});
                certrow.append(group);
                group.append($('<label></label>', {class: 'control-label col-sm-3', for:"colors"}).text('LE Color'));
                var ctrl = $('<div></div>', {class:'col-sm-8'});
                //Only one color is available to pick. The number scale maximum is set to max LE mass
                var picker = $('<div></div>');
                picker.slider({
                    //range: true,
                    values: [0, this.spill._per_le_mass/3, 2*this.spill._per_le_mass/3, this.spill._per_le_mass],
                    min: 0,
                    max: this.spill._per_le_mass,
                    step: this.spill._per_le_mass / 255,
                    classes: {"ui-slider": "ui-icon-caret-1-n"},
                    create: _.bind(function(){
                        $('.ui-slider-handle', this).each(_.bind(function(idx, elem) {
                            $(elem).html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.slider('values')[idx] + '</div></div>');
                        }, this));
                        
                    }, picker)
                    
                });
                ctrl.append(picker);
                group.append(ctrl);
                rows.push(certrow);
            }
        },

        updateCfg: function(e) {
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
            if($(e.target).attr('type') === 'number'){
                value = parseFloat(value);
            }

            if($(e.target).attr('type') === 'checkbox'){
                value = e.currentTarget.checked;
            }

            if (name.includes('colors') && typeof value === 'string') { // special case for colors; turns a single string into a list
                value = [value];
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