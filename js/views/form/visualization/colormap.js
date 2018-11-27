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
    The purpose of this view is to manage and configure a mapping
    between a number scale and a color map.
    */
    var colormapForm = BaseForm.extend({
        events: {
            'change .tooltip input[type="color"]': 'updateColorScale',
            //'change .tooltip input[type="number"]': 'updateScales',
            'pointerup .tooltip-inner': 'pu',
            'pointerdown .tooltip-inner': 'pd',
            'focusout .tooltip input[type="number"]': 'updateValue',
            'click .add': 'addStop',
            'click .remove': 'removeStop',
            'chosen:showing_dropdown #scheme-picker': 'applySchemeBackgrounds',
            'change #scheme-picker': 'applySchemeBackgrounds'
        },

        initialize: function(model, appearanceModel) {
            this.model = model;
            this.appearanceModel = appearanceModel;
            this.render();
            this.listenTo(this.model, 'change:colorScaleRange', this.applySchemeBackgrounds);
            this.listenTo(this.model, 'changedInterpolation', this.rerender);
            this.listenTo(this.model, 'change:units', this.rerender);
        },

        pd: function(e) {
            //pointermousedown
            this._pdPosition = {x: e.clientX, y:e.clientY};
        },

        pu: function(e) {
            //pointermouseup
            var dx = e.clientX - this._pdPosition.x,
                dy = e.clientY - this._pdPosition.y;

            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                return;
            }
            else if ($('input', $(e.currentTarget)).length > 0) {
                $('input', $(e.currentTarget)).focus();
            }
            else {
                var valueBox = $('<input>', {type:'number',
                                             class: 'numberScaleDomain',
                                             step: 0.001});

                valueBox.prop('value', parseFloat(e.currentTarget.innerText));
                valueBox.attr('value', parseFloat(e.currentTarget.innerText));

                $(e.currentTarget).text('').append(valueBox);
                valueBox.focus();
            }
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
            .chosen({disable_search: true,
                     width: "100%"
            });
        },

        genSlider: function() {
            var numberRange = _.clone(this.model.get('numberScaleRange'));
            var min = 0;
            var max = 1;

            if (this.picker.slider('instance')) {
                this.picker.slider('destroy');
            }

            this.picker.slider({
                //range: true,
                values: this.model.get('numberScaleDomain').map(this.model.numScale),
                min: min,
                max: max,
                step: 0.005,
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

            this.model.setValue('numberScaleDomain', ui.handleIndex,
                                this.model.numScale.invert(curr));
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

            if (this.model.get('interpolate')) {
                // each handle must have a number and color tooltip
                for (i = 0; i < handles.length; i++) {
                    this.numberStops.push(this.createNumberTip(this.model.get('numberScaleDomain')[i], $(handles[i])));
                    this.colorStops.push(this.createColorTip(this.model.get('colorScaleRange')[i], $(handles[i])));
                }
            }
            else {
                // each handle must have a number tooltip,
                // but the color tooltips are on the slider between the handles
                for (i = 0; i < handles.length; i++) {
                    this.numberStops.push(this.createNumberTip(this.model.get('numberScaleDomain')[i], $(handles[i])));
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

            var dispValue = this._toDisplayString(value);

            inner.text(dispValue);
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

            colorBox = $('<input>',{type: 'color', class: 'colorScaleRange',
                                    value: color});

            colorToolTip.append(arrow);
            colorToolTip.append(inner);
            inner.append(colorBox);

            parentElem.append(colorToolTip);

            return colorToolTip;
        },

        updateAllTooltips: function(e) {
            // reinitializes all the tooltips on the slider
            // from the scale objects they represent
            var ttc, i;

            for (i = 0; i < this.numberStops.length; i++) {
                ttc = $('input', this.numberStops[i]);
                ttc.prop('value', this._toDisplayString(this.model.get('numberScaleDomain')[i]));
            }

            for (i = 0; i < this.colorStops.length; i++) {
                ttc = $('input', this.colorStops[i]);
                ttc.prop('value', this.model.get('colorScaleRange')[i]);
            }

            this.updateBackground();
        },

        _genBackgroundString: function(domain, colors, interpolate) {
            //generates and returns a background linear-gradient string
            //domain is an array of numbers on a linear number scale
            var backgroundString = 'linear-gradient(to right, ';
            var i, boundary;

            if (interpolate)  {
                for (i = 0; i < colors.length - 1; i++) {
                    boundary = (domain[i] - domain[0]) / (domain[domain.length-1] - domain[0]) * 100;
                    backgroundString += `${colors[i]} ${boundary}%, `;
                }

                backgroundString += `${colors[i]} 100%)`;
            }
            else {
                var curbounds = 0;

                for (i = 0; i < colors.length - 1; i++) {
                    boundary = (domain[i+1] - domain[0]) / (domain[domain.length-1] - domain[0]) * 100;
                    backgroundString += `${colors[i]} ${curbounds}%, ${colors[i]} ${boundary}%, `;
                    curbounds = boundary;
                }

                backgroundString += `${colors[i]} ${curbounds}%, ${colors[i]} 100%)`;
            }

            return backgroundString;
        },

        updateBackground: function() {
            //set background CSS based on state of scale and color configs
            var backgroundString = 'linear-gradient(to right, ';
            var i, boundary;
            var numberDomain = this.picker.slider('values');
            var colorRange = this.model.get('colorScaleRange');
            var bgString = this._genBackgroundString(numberDomain, colorRange,
                                                     this.model.get('interpolate'));

            if (colorRange.length === 1) {
                this.colorStops[0].css('left', '50%');
            }

            if (!this.model.get('interpolate')) {
                var curbounds = 0;

                for (i = 0; i < colorRange.length - 1; i++) {
                    boundary = (numberDomain[i+1] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100;
                    this.colorStops[i].css('left', ((boundary - curbounds) / 2 + curbounds) + '%');
                    curbounds = boundary;
                }

                this.colorStops[i].css('left', ((100 - curbounds) / 2   + curbounds) + '%');
            }

            this.picker.css('background', bgString);
        },

        applySchemeBackgrounds: function(e, selected) {
            var genBGString = _.bind(function(name) {
                var colors, range, interpolate;

                if ('interpolate'+name in d3) {
                    var d3scheme = d3['interpolate'+name];
                    range = _.range(0,1.1,0.1);
                    colors = range.map(d3scheme);
                    interpolate = true;
                }
                else if ('scheme' + name in d3) {
                    colors = d3['scheme'+name];
                    range = _.range(0,colors.length+1, 1);
                    interpolate = false;
                }
                else {
                    colors = this.model.get('_customScheme');
                    range = this.model.get('numberScaleRange');
                    interpolate = this.model.get('interpolate');
                }

                var bgString = this._genBackgroundString(range, colors,
                                                         interpolate);

                return bgString;
            }, this);

            var options = $('li', $('.chosen-results', this.$el));

            if (_.isUndefined(e) || e.type !== 'change') {
                for (var i = 0; i < options.length; i++) {
                    var name = $(options[i]).text();
                    $(options[i]).css('background', genBGString(name));
                }

                $('.chosen-single', this.$el).css('background',
                                                  genBGString(this.model.get('scheme')));
            } else {
                if (selected) {
                    $('.chosen-single', this.$el).css('background',
                                                      genBGString(selected.selected));
                    this.model.set('scheme', selected.selected);
                }
                else {
                    $('.chosen-single', this.$el).css('background',
                                                      genBGString(this.model.get('scheme')));
                }
            }
        },

        focusInput: function(e) {
            e.currentTarget.disabled = false;
            e.currentTarget.focus();

            console.log(e);
        },

        updateValue(e) {
            for (var i = 0; i < this.numberStops.length; i++) {
                if (this.numberStops[i].has(e.currentTarget).length > 0) {
                    break;
                }
            }

            var newVal = (this.model
                          .fromInputConversionFunc(parseFloat(e.currentTarget.value)));

            if (this.model.setStop(i, newVal)) {
                this.picker.slider('values',
                                   this.model.get('numberScaleDomain')
                                   .map(this.model.numScale));

                $(e.currentTarget).remove();
                $('.tooltip-inner',
                  this.numberStops[i]).text(this._toDisplayString(newVal));

                this.updateBackground();
            }
            else {
                $(e.currentTarget).remove();
                $('.tooltip-inner',
                  this.numberStops[i])
                  .text(this._toDisplayString(this.model.get('numberScaleDomain')[i]));
            }
        },

        updateNumberTooltip: function(e, ui) {
            var ttc = $('.top > .tooltip-inner', $(ui.handle));

            if ($('input[type="number"]', ttc).length > 0) {
                $('input[type="number"]', ttc).remove();
            }

            ttc.text(this._toDisplayString(this.model
                                           .numScale.invert(ui.value)));
        },

        updateColorScale: function(e) {
            var stops = _.clone(this.model.get('colorScaleRange'));

            for (var i = 0; i < this.colorStops.length; i++) {
                if ($('input', this.colorStops[i])[0] === e.currentTarget) {
                    stops[i] = e.currentTarget.value; 
                }
            }

            this.model.set('scheme', 'Custom', {silent:false});
            this.model.set('colorScaleRange', stops);

            this.updateBackground();
        },

        addStop: function(e) {
            this.model.addStop(this.model.get('numberScaleDomain').length - 1);
            this.rerender();
        },

        removeStop: function(e) {
            this.model.removeStop(this.model.get('numberScaleDomain').length - 2);
            this.rerender();
        },

        rerender: function() {
            this.$el.html('');
            this.render();
        },

        _toDisplayString(value) {
            var dispValue = this.model.toDisplayConversionFunc(value);

            if (typeof(dispValue) === 'string') {
                return dispValue;
            }
            else {
                return Number(dispValue).toPrecision(4);
            }
        },

        _fromInput(value) {
            return Number(this.model
                          .fromInputConversionFunc(parseFloat(value)))
                          .toPrecision(4);
        }

    });

    return colormapForm;
});
