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
            'change .tooltip input[type="number"]': 'updateScales',
            'focusout .tooltip input[type="number"]': 'updateScales'
        },

        initialize: function(config, appearanceModel) {
            this.config = config;
            this.appearanceModel = appearanceModel;
            this.scaleConfig = this.config.colorMaps[config._chosenColorMapType].number_scale_config;
            this.colorMapConfig = this.config.colorMaps[config._chosenColorMapType].color_scale_config;
            this.colors = this.colorMapConfig.range;
            this.render();
        },

        render: function() {
            var min = this.scaleConfig.domain[0]
            var max = this.scaleConfig.domain[this.scaleConfig.domain.length - 1]
            this.$el = $(_.template(ColormapTemplate, {type:'diverging'}));
            this.picker = $('#colormap-slider', this.$el);
            this.picker.slider({
                //range: true,
                values: this.scaleConfig.domain,
                min: min,
                max: max,
                step: max / 255,
                classes: {"ui-slider": "ui-icon-caret-1-n"},
                create: _.bind(function() {
                    var handles = $('.ui-slider-handle', this.picker);
                    this.setupSliderHandles(handles);
                }, this),
                slide: _.bind(function(e) {
                    if (e.originalEvent.type === 'mousemove') {
                        this.updateAllTooltips(e);
                    }
                }, this)
            });
            this.updateBackground();
        },

        setupSliderHandles: function(handles) {
            this.sliderHandles = handles;
            this.tooltipControls = [];
            $(handles[0]).addClass('slider-first');
            $(handles[handles.length-1]).addClass('slider-last');
            var i;

            if (this.config._chosenColorMapType !== 'Diverging') {
                for (i = 0; i < handles.length; i++) {
                    this.tooltipControls.push([]);
                    this.tooltipControls[i].push(this.createHandleNumberTip(this.picker.slider('values')[i], this.colors[i], $(handles[i]), i));
                    this.tooltipControls[i].push(this.createHandleColorTip(this.picker.slider('values')[i], this.colors[i], $(handles[i]), i));
                }
            } else {
                for (i = 0; i < handles.length; i++) {
                    this.tooltipControls.push([]);
                    this.tooltipControls[i].push(this.createHandleNumberTip(this.picker.slider('values')[i], this.colors[i], $(handles[i]), i ));
                }
                //put in color tips separately because there are only ever 2 of them, and they are only on the first and last handles
                this.tooltipControls[0].push(this.createHandleColorTip(this.picker.slider('values')[0], this.colors[0], $(handles[0]), 0));
                this.tooltipControls[2].push(this.createHandleColorTip(this.picker.slider('values')[1], this.colors[1], $(handles[2]), 1));
            }
            for (i = 1; i < handles.length-1; i++) {
                $(handles[i]).addClass('movable');
            }
        },

        createHandleNumberTip: function(value, color, handle, idx) {
            var valueToolTip, arrow, inner, valueBox;
            valueToolTip = $('<div></div>',{class: "tooltip top slider-tip"});
            arrow = $('<div></div>',{class: "tooltip-arrow"});
            inner = $('<div></div>',{class: "tooltip-inner"});
            valueBox = $('<input>',{type:'number', class: 'stop-value', name: 'values-'+idx, step: 0.001});
            valueBox.prop('value', value);
            valueToolTip.append(arrow);
            valueToolTip.append(inner);
            inner.append(valueBox);
            valueToolTip.on
            handle.append(valueToolTip);
            return valueBox;
        },

        createHandleColorTip: function(value, color, handle, idx) {
            var colorToolTip, arrow, inner, colorBox;
            colorToolTip = $('<div></div>',{class: "tooltip bottom slider-tip"});
            arrow = $('<div></div>',{class: "tooltip-arrow"});
            inner = $('<div></div>',{class: "tooltip-inner"});
            colorBox = $('<input>',{type:'color', class: 'color-value', name: 'colors-'+idx, value: color});
            colorToolTip.append(arrow);
            colorToolTip.append(inner);
            inner.append(colorBox);
            handle.append(colorToolTip)
            return colorBox;
        },

        updateAllTooltips: function(e) {
            //reinitializes all the tooltips on the slider from the scale objects they represent
            var ttc, inputElem;
            for (var i = 0; i < this.tooltipControls.length; i++) {
                for (var k = 0; k < this.tooltipControls[i].length; k++) {
                    ttc = this.tooltipControls[i][k];
                    if (!ttc) { continue; }
                    var idx = ttc.attr('name').split('-')[1];
                    if(ttc.attr('type') === 'color') {    //color tooltip
                        ttc.attr('value', this.colorMapConfig.range[idx]);
                    } else {
                        ttc.prop('value', this.scaleConfig.domain[idx]);
                    }
                }
            }
            this.updateBackground();
        },

        updateBackground: function() {
            //set background CSS based on state of scale and color configs
            if (this.config._chosenColorMapType === 'Alpha') {
                //Single color. Use first color in color range.
                this.picker.css('background', this.colorMapConfig.range[0]);
            } else if (this.config._chosenColorMapType === 'Diverging') {
                var domain = this.scaleConfig.domain
                var boundaryPercent = (domain[1] - domain[0]) / (domain[domain.length-1] - domain[0]) * 100;
                boundaryPercent = boundaryPercent + '%'
                var color1 = this.colorMapConfig.range[0];
                var color2 = this.colorMapConfig.range[1];
                this.picker.css('background', `linear-gradient(to right, ${color1} 0%, ${color1} ${boundaryPercent}, ${color2} ${boundaryPercent}, ${color2} 100%)`)
            } else {
            }
            this.appearanceModel.trigger('change', this.appearanceModel);
        },

        updateScales: function( e ) {
            //$('input[type="number"]', ui.handle).value = ui.value;
            console.log(e);
            if(e.type === 'change') { // cuts out all the bullshit
                e.stopImmediatePropagation();
            } else { // focusout - user is done entering a value
                console.log(e);
                var val = parseFloat(e.currentTarget.value);
                var idx = parseInt(e.currentTarget.name.split('-')[1]);
                this.picker.slider('values', idx, val);
                this.updateBackground();
            }
            
        },

        updateColorScale: function(e) {
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
            if (name.includes('color')) {
                name = name.split('-');
                var idx = name[1];
                name = name[0];
                if (this.config._chosenColorMapType === 'Alpha') {
                    for(var i = 0; i < this.colorMapConfig.range.length; i++) {
                        this.colorMapConfig.range[i] = value;
                    }
                    this.updateAllTooltips();
                    this.updateBackground();
                } else {
                    this.colorMapConfig.range[idx] = value;
                }
            }
            this.updateBackground();
        },

        updateNumberScale: function(e) {
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
        }

    });
    return colormapForm;
});