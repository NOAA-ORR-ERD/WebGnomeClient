define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/base',
    'module',
    'd3',
    'chosen',
    'text!templates/form/visualization/colormap.html'
], function ($, _, Backbone, BaseForm, module, d3, chosen, ColormapTemplate) {
    "use strict";

    /*
    The purpose of this view is to manage and configure a mapping between a number scale and a color map.
    
    */
    var colormapForm = BaseForm.extend({

        events: {
            'change .tooltip input[type="text"]': 'updateColorScale',
            //'change .tooltip input[type="number"]': 'updateScales',
            'click .tooltip input[type="number"]': 'focusInput',
            'focusout .tooltip input[type="number"]': 'updateValue',
            'click .add': 'add',
            'click .remove': 'remove',
            'chosen:showing_dropdown #scheme-picker': 'applySchemeBackgrounds',
            'change #scheme-picker': 'applySchemeBackgrounds'
        },

        initialize: function(model, appearanceModel) {
            this.model = model;
            this.appearanceModel = appearanceModel;
            this.render();
            this.listenTo(this.model, 'changedInterpolation', this.rerender);
            this.listenTo(this.model, 'change:colorScaleRange', this.rerender);
            this.listenTo(this.model, 'numberScaleDomain:change', this.rerender);
        },

        render: function() {
            this.$el.append(_.template(ColormapTemplate, {
                model: this.model
            }));
            this.picker = $('#colormap-slider', this.$el);
            this.genSlider();
            this.updateBackground();
            this.schemePicker = $('#scheme-picker', this.$el)
            .on('chosen:ready', _.bind(this.applySchemeBackgrounds, this))
            .chosen({
                disable_search: true,
                width: "100%"
            });
        },

        computeStops: function(min, max, num) {
            var a = [];
            a.push(min);
            for(var i = 1; i < num-1; i++) {
                a.push( (i * (max-min))/(num-1) + min);
            }
            a.push(max);
            return a;
        },

        applySchemeBackgrounds: function(e, selected) {
            var genBGString = _.bind(function(name) {
                var colors;
                if ('interpolate'+name in d3) {
                    var d3scheme = d3['interpolate'+name];
                    colors = _.range(0,1.1,0.1).map(d3scheme);
                } else {
                    colors = this.model.get('_customScheme');
                }
                var bgstring = 'linear-gradient(to right, ' + colors[0];
                for (var k = 1; k < colors.length; k++) {
                    bgstring += ', ' + colors[k];
                }
                bgstring += ')';
                return bgstring;
            }, this);
            var options = $('li', $('.chosen-results', this.$el));
            if (e.type !== 'change') {
                for (var i = 0; i < options.length; i++) {
                    var name = $(options[i]).text();
                    $(options[i]).css('background', genBGString(name));
                }
                $('.chosen-single', this.$el).css('background', genBGString(this.model.get('scheme')));
            } else {
                if (selected) {
                    $('.chosen-single', this.$el).css('background', genBGString(selected.selected));
                    this.model.set('scheme', selected.selected);
                } else {
                    $('.chosen-single', this.$el).css('background', genBGString(this.model.get('scheme')));
                }
            }
        },

        genSlider: function() {
            var numberDomain = this.model.get('numberScaleDomain');
            var min = numberDomain[0];
            var max = numberDomain[numberDomain.length - 1];
            if(this.picker.slider('instance')) {
                this.picker.slider('destroy');
            }
            this.picker.slider({
                //range: true,
                values: numberDomain,
                min: min,
                max: max,
                step: max / 500,
                classes: {"ui-slider": "ui-icon-caret-1-n"},
                create: _.bind(function() {
                    var handles = $('.ui-slider-handle', this.picker);
                    this.setupSliderHandles(handles);
                }, this),
                slide: _.bind(this.slideHandler, this)
            });
        },

        slideHandler: function(e, ui) {
            var curr = ui.values[ui.handleIndex],
                next = ui.values[ui.handleIndex + 1] - 0.01,
                prev = ui.values[ui.handleIndex - 1] + 0.01;
            
            if (curr > next || curr < prev || !ui.handle) {
                return false;
            }
            this.updateNumberTooltip(e, ui);
            this.updateBackground();
            return true;
        },

        setupSliderHandles: function(handles) {
            this.sliderHandles = handles;
            this.numberStops = [];
            this.colorStops = [];
            //$(handles[0]).addClass('slider-first');
            //$(handles[handles.length-1]).addClass('slider-last');
            var i;

            if (this.model.get('interpolate')) { // each handle must have a number and color tooltip
                for (i = 0; i < handles.length; i++) {
                    this.numberStops.push(this.createNumberTip(this.picker.slider('values')[i], $(handles[i])));
                    this.colorStops.push(this.createColorTip(this.model.get('colorScaleRange')[i], $(handles[i])));
                }
            } else { // each handle must have a number tooltip, but the color tooltips are on the slider between the handles
                for (i = 0; i < handles.length; i++) {
                    this.numberStops.push(this.createNumberTip(this.picker.slider('values')[i], $(handles[i])));
                }
                for (i = 0; i < handles.length -1; i++) {
                    this.colorStops.push(this.createColorTip(this.model.get('colorScaleRange')[i], this.picker));
                }
            }
            for (i = 1; i < handles.length-1; i++) {
                $(handles[i]).addClass('movable');
            }
        },

        createNumberTip: function(value, parentElem) {
            var valueToolTip, arrow, inner, valueBox;
            valueToolTip = $('<div></div>',{class: "tooltip top slider-tip"});
            arrow = $('<div></div>',{class: "tooltip-arrow"});
            inner = $('<div></div>',{class: "tooltip-inner"});
            valueBox = $('<input>',{type:'number', class: 'numberScaleDomain', step: 0.001});
            valueBox.prop('value', value);
            valueToolTip.append(arrow);
            valueToolTip.append(inner);
            inner.append(valueBox);
            parentElem.append(valueToolTip);
            return valueToolTip;
        },

        createColorTip: function(color, parentElem) {
            var colorToolTip, arrow, inner, colorBox;
            colorToolTip = $('<div></div>',{class: "tooltip bottom slider-tip"});
            arrow = $('<div></div>',{class: "tooltip-arrow"});
            inner = $('<div></div>',{class: "tooltip-inner"});
            colorBox = $('<input>',{type: 'color', class: 'colorScaleRange', value: color});
            colorToolTip.append(arrow);
            colorToolTip.append(inner);
            inner.append(colorBox);
            parentElem.append(colorToolTip)
            return colorToolTip;
        },

        updateAllTooltips: function(e) {
            //reinitializes all the tooltips on the slider from the scale objects they represent
            var ttc, i;
            for (i = 0; i < this.numberStops.length; i++) {
                ttc = $('input', this.numberStops[i]);
                ttc.prop('value', this.model.get('numberScaleDomain')[i]);
            }
            for (i = 0; i < this.colorStops.length; i++) {
                ttc = $('input', this.colorStops[i]);
                ttc.prop('value', this.model.get('colorScaleRange')[i]);
            }
            this.updateBackground();
        },

        updateBackground: function() {
            //set background CSS based on state of scale and color configs
            var backgroundString = 'linear-gradient(to right, ';
            var i, boundary;
            var numberDomain = this.model.get('numberScaleDomain');
            var numberRange = this.model.get('numberScaleRange');
            var colorDomain = this.model.get('colorScaleDomain');
            var colorRange = this.model.get('colorScaleRange');
            if(this.model.get('interpolate') || this.model.get('colorScaleType') === 'linear') {
                for (i = 0; i < colorRange.length - 1; i++) {
                    boundary = (numberDomain[i] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100;
                    backgroundString += `${colorRange[i]} ${boundary}%, `;
                }
                backgroundString += `${colorRange[i]} 100%)`;
                if (colorRange.length === 1) {
                    this.colorStops[0].css('left', '50%');
                }
            } else {
                var curbounds = 0;
                for (i = 0; i < colorRange.length - 1; i++) {
                    boundary = (numberDomain[i+1] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100;
                    backgroundString += `${colorRange[i]} ${curbounds}%, ${colorRange[i]} ${boundary}%, `
                    this.colorStops[i].css('left', ((boundary - curbounds) / 2 + curbounds) + '%');
                    curbounds = boundary;
                }
                backgroundString += `${colorRange[i]} ${curbounds}%, ${colorRange[i]} 100%)`;
                this.colorStops[i].css('left', ((100 - curbounds) / 2   + curbounds) + '%');
            }
            this.picker.css('background', backgroundString);
            this.appearanceModel.trigger('change', this.appearanceModel);
        },

        focusInput: function(e) {
            e.currentTarget.focus();
        },

        updateValue(e) {
            for (var i = 0; i < this.numberStops.length; i++) {
                if (this.numberStops[i].has(e.currentTarget).length > 0) {
                    break;
                }
            }
            var newVals = _.clone(this.picker.slider('values'));
            newVals[i] = e.currentTarget.value;
            var success = this.slideHandler(e, {
                handle: this.numberStops[i],
                handleIndex: i,
                value: e.currentTarget.value,
                values: newVals
            });
            if (!success) {
                this.updateNumberTooltip(e, {handle:this.numberStops[i], value:this.picker.slider('values', i)});
            }
        },

        updateNumberTooltip: function(e, ui) {
            var ttc = $('input[type="number"]', ui.handle);
            ttc.prop('value', ui.value);
        },

        updateColorScale: function(e) {
            var stops = _.clone(this.model.get('colorScaleRange'));
            for (var i = 0; i < this.colorStops.length; i++) {
                if ($('input', this.colorStops[i])[0] === e.currentTarget) {
                    stops[i] = e.currentTarget.value; 
                }
            }
            this.model.set('colorScaleRange', stops);
            this.updateBackground();
        },
        add: function(e) {
            this.model.addStop(this.model.get('numberScaleDomain').length - 1);
            this.rerender();
        },

        remove: function(e) {
            this.model.removeStop(this.model.get('numberScaleDomain').length - 2);
            this.rerender();
        },

        rerender: function() {
            this.$el.html('');
            this.render();
        },

        _forceAscending: function(e, ui) {
            //forces
        }

    });
    return colormapForm;
});