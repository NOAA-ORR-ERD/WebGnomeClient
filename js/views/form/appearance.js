define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/base',
    'module',
    'model/appearance',
    'd3'
], function ($, _, Backbone, BaseForm, module, Appearance, DDD) {
    "use strict";
    var appearanceForm = BaseForm.extend({

        events: {
            'change .appearance-edit input': 'update',
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
            var attrValues = _.values(this.model.attributes);
            for(var i = 0; i < attrNames.length; i++) {
                var row = $('<div></div>', {class: 'form-row'});
                row.append(this.genControlByName(ctrlNames[i], attrNames[i], this.model.get(attrNames[i])));
                html.append(row);
            }
            this.$el.html(html);
        },

        genControlByName: function(ctrlName, attrName, attrValue) {
            /*
            This function uses the name of a particular appearance attribute to determine the appropriate control to add.
            It searches for a key descriptor in the name and uses that to determine the control.
            Keywords:
                'color' - Color Picker
                '
            */
            var ctrl = $('<div></div>');
            if(attrName.includes('on')){
                ctrl.addClass('col-sm-1');
                ctrl.append($('<input>', {type: "checkbox", class: "form-control", checked: attrValue, name: attrName}));
            } else if (attrName.includes('color')) {
                ctrl.addClass('col-sm-3');
                ctrl.append($('<input>', {type: "color", class: "form-control", name: attrName, value: attrValue}));
            } else if (attrName.includes('alpha') || attrName.includes('scale')) {
                ctrl.addClass('col-sm-3');
                ctrl.append($('<input>', {type: "number", class: "form-control", value: attrValue, step:"0.01", min:"0", max:"1", name: attrName}));
            } else if(attrName === 'name'){
                ctrl.addClass('col-sm-3');
                ctrl.append($('<input>', {type: "text", class: "form-control", value: attrValue, name: attrName}));
            } else {
                return '';
            }

            var html = $('<div></div>', {class: 'form-group'});
            var label = $('<label></label>', {class: "col-sm-3 control-label", 'for': attrName});
            label.text(ctrlName.replace('_',' '));
            html.append(label);
            html.append(ctrl);
            return html;
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