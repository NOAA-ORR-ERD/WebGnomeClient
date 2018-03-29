define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/appearance',
    'module',
    'model/appearance',
    'd3',
    'json!model/defaultSpillAppearances.json'
], function ($, _, Backbone, BaseAppearanceForm, module, Appearance, DDD, defaultSA) {
    "use strict";
    var spillAppearanceForm = BaseAppearanceForm.extend({

        events: {
            'change .appearance-edit input': 'update',
            'change .appearance-edit select': 'update',
            'change .datavis-config input': 'updateCfg'
        },


        initialize: function(model) {
            this.model = model;
            this.addListeners();
            this.render();
            var scheme = DDD.schemeBrBG[11];
            var canvas = this.el.appendChild(document.createElement('canvas'));
            var c = canvas.getContext('2d');
            var height, colormap = scheme;
            c.canvas.height = 40
            c.canvas.width = 648;
            for (var j = 0; j < scheme.length; j++) {
                c.fillStyle = colormap[j];      // start ind at index 0
                c.fillRect(j*10, 0, 10, 40);
            }
        },

        addListeners: function() {
            
        },

        render() {
            var html = $('<form></form>',{ 'class': 'form-horizontal appearance-edit', 'role': 'form', 'id': this.model.get('id')});
            var attrNames = _.keys(this.model.get('ctrl_names'));
            var ctrlNames = _.values(this.model.get('ctrl_names'));
            for(var i = 0; i < attrNames.length; i++) {
                var row = $('<div></div>', {class: 'form-row'});
                row.append(this.genControlByName(ctrlNames[i], attrNames[i], this.model.get(attrNames[i])));
                html.append(row);
            }
            if (this.model.get('data')){
                row = $('<div></div>', {class: 'form-row'});
                row.append(this.genDataPicker());
                html.append(row);
                row = $('<div></div>', {class: 'form-row'});
                row.append(this.genDataControls(this.model.get('datavis')));
                html.append(row);
            }
            this.$el.html(html);
        },

        genDataPicker: function() {
            var html = $('<div></div>', {class: 'form-group'});
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
            html.append(label);
            html.append(ctrl);
            return html;
        },

        genDataControls: function(config) {
            if (config.title === 'Mass') {
                return this.genMassControls(config)
            }
        },

        genMassControls: function(config) {
            var html = $('<form></form>', {class: 'form-row datavis-config'});
            config.colorMapType.forEach(
                function(t, i) {
                    var btn = $('<label></label>', {class: 'radio-inline col-sm-3'})
                                .append($('<input></input>', {type: 'radio', name: '_chosenColorMapType', value: t}))
                                .append(t);
                    if(!config._chosenColorMapType) {
                        config._chosenColorMapType = t
                    }
                    if (config._chosenColorMapType === t) {
                        btn.click();
                    }
                    html.append(btn)
                }
            );
            return html
        },

        updateCfg: function(e) {
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
            name = name.split(':');
            var curobj = this.model.get('datavis');
            for (var i = 0; i < name.length-1; i++) {
                curobj = curobj[name]
            }
            curobj[name[i]] = value;
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