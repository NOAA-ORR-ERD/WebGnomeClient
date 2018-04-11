define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/base',
    'module',
    'd3',
    'text!templates/form/visualization/colormap.html'
], function ($, _, Backbone, BaseForm, module, DDD, ColormapTemplate) {
    "use strict";

    /*
    The purpose of this view is to manage and configure a mapping between a number scale and a color map.
    
    */
    var colormapForm = BaseForm.extend({

        events: {
            'change .tooltip input[type="color"]': 'updateColorScale',
            //'change .tooltip input[type="number"]': 'updateScales',
            'click .tooltip input[type="number"]': 'focusInput',
            'focusout .tooltip input[type="number"]': 'updateScales',
            'change .interpolate-checkbox': 'toggleInterpolation'
        },

        initialize: function(config, appearanceModel) {
            this.config = config;
            this.appearanceModel = appearanceModel;
            this.scaleConfig = this.config.colorMaps[config._chosenColorMapType].number_scale_config;
            this.colorMapConfig = this.config.colorMaps[config._chosenColorMapType].color_scale_config;
            this.colors = this.colorMapConfig.range;
            this.render();
            //this.listenTo(this.appearanceModel, 'change', this.rerender);
        },

        render: function() {
            this.$el.append(_.template(ColormapTemplate, {
                type:'diverging',
                config: this.config
            }));
            this.picker = $('#colormap-slider', this.$el);
            this.genSlider();
            this.updateBackground();
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

        genSlider: function() {
            var min = this.scaleConfig.domain[0];
            var max = this.scaleConfig.domain[this.scaleConfig.domain.length - 1];
            if(this.picker.slider('instance')) {
                this.picker.slider('destroy');
            }
            this.picker.slider({
                //range: true,
                values: this.scaleConfig.domain,
                min: min,
                max: max,
                step: max / 500,
                classes: {"ui-slider": "ui-icon-caret-1-n"},
                create: _.bind(function() {
                    var handles = $('.ui-slider-handle', this.picker);
                    this.setupSliderHandles(handles);
                }, this),
                slide: _.bind(function(e, ui) {
                    if (e.originalEvent.type === 'mousemove') {
                        this.updateAllTooltips(e, ui);
                    }
                }, this)
            });
        },

        setupSliderHandles: function(handles) {
            this.sliderHandles = handles;
            this.numberStops = [];
            this.colorStops = [];
            //$(handles[0]).addClass('slider-first');
            //$(handles[handles.length-1]).addClass('slider-last');
            var i;

            if (this.config.interpolate) { // each handle must have a number and color tooltip
                for (i = 0; i < handles.length; i++) {
                    this.numberStops.push(this.createNumberTip(this.picker.slider('values')[i], $(handles[i])));
                    this.colorStops.push(this.createColorTip(this.colors[i], $(handles[i])));
                }
            } else { // each handle must have a number tooltip, but the color tooltips are on the slider between the handles
                for (i = 0; i < handles.length; i++) {
                    this.numberStops.push(this.createNumberTip(this.picker.slider('values')[i], $(handles[i])));
                }
                for (i = 0; i < handles.length -1; i++) {
                    this.colorStops.push(this.createColorTip(this.colorMapConfig.range[i], this.picker));
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
            valueBox = $('<input>',{type:'number', class: 'stop-value', step: 0.001});
            valueBox.prop('value', value);
            valueToolTip.append(arrow);
            valueToolTip.append(inner);
            inner.append(valueBox);
            valueToolTip.on
            parentElem.append(valueToolTip);
            return valueToolTip;
        },

        createColorTip: function(color, parentElem) {
            var colorToolTip, arrow, inner, colorBox;
            colorToolTip = $('<div></div>',{class: "tooltip bottom slider-tip"});
            arrow = $('<div></div>',{class: "tooltip-arrow"});
            inner = $('<div></div>',{class: "tooltip-inner"});
            colorBox = $('<input>',{type:'color', class: 'color-value', value: color});
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
                ttc.prop('value', this.scaleConfig.domain[i]);
            }
            for (i = 0; i < this.colorStops.length; i++) {
                ttc.attr('value', this.colorMapConfig.range[i]);
            }
            this.updateBackground();
        },

        updateBackground: function() {
            //set background CSS based on state of scale and color configs
            var backgroundString = 'linear-gradient(to right, ';
            var i, boundary;
            var domain = this.scaleConfig.domain
            if(this.config.interpolate || this.colorMapConfig.type === 'linear') {
                for (i = 0; i < this.colorMapConfig.range.length - 1; i++) {
                    boundary = (domain[i] - domain[0]) / (domain[domain.length-1] - domain[0]) * 100;
                    backgroundString += `${this.colorMapConfig.range[i]} ${boundary}%, `;
                }
                backgroundString += `${this.colorMapConfig.range[i]} 100%)`;
                if (this.colorStops.length === 1) {
                    this.colorStops[0].css('left', '50%');
                }
            } else {
                var curbounds = 0;
                for (i = 0; i < this.colorMapConfig.range.length - 1; i++) {
                    boundary = (domain[i+1] - domain[0]) / (domain[domain.length-1] - domain[0]) * 100;
                    backgroundString += `${this.colorMapConfig.range[i]} ${curbounds}%, ${this.colorMapConfig.range[i]} ${boundary}%, `
                    this.colorStops[i].css('left', ((boundary - curbounds) / 2 + curbounds) + '%');
                    curbounds += boundary;
                }
                backgroundString += `${this.colorMapConfig.range[i]} ${curbounds}%, ${this.colorMapConfig.range[i]} 100%)`;
                this.colorStops[i].css('left', ((100 - curbounds) / 2   + curbounds) + '%');
            }
            this.picker.css('background', backgroundString);
            this.appearanceModel.trigger('change', this.appearanceModel);
        },

        focusInput: function(e) {
            e.currentTarget.focus();
        },

        updateScales: function(e) {
            //$('input[type="number"]', ui.handle).value = ui.value;
            console.log(e);
            var ttc, i;
            for (i = 0; i < this.numberStops.length; i++) {
                ttc = $('input', this.numberStops[i]);
                this.scaleConfig.domain[i] = ttc.prop('value');
                this.picker.slider('values', i, ttc.prop('value'));
            }
            this.updateBackground();
            this.updateAllTooltips();
        },

        updateColorScale: function(e) {
            for (var i = 0; i < this.colorStops.length; i++) {
                if ($('input', this.colorStops[i])[0] === e.currentTarget) {
                    this.colorMapConfig.range[i] = e.currentTarget.value;
                }
            }
            this.updateBackground();
        },

        updateNumberScale: function(e) {
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
        },

        toggleInterpolation: function(e) {
            //modifies the colorMapConfig between threshold and linear modes
            if(e.currentTarget.checked) {
                this.colorMapConfig.type = 'linear';
                this.colorMapConfig.domain = this.scaleConfig.range.slice();
                this.colorMapConfig.range.splice(this.colorMapConfig.range.length - 1, 0, '#FFFFFF');
            } else {
                this.colorMapConfig.type = 'threshold';
                this.colorMapConfig.domain = this.scaleConfig.range.slice(1, this.scaleConfig.range.length - 1);
                this.colorMapConfig.range.splice(this.colorMapConfig.range.length - 2, 1);
            }
        },

        rerender: function() {
            this.$el.html('');
            this.render();
        }

    });
    return colormapForm;
});