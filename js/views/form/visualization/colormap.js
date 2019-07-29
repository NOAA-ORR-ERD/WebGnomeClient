define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/base',
    'module',
    'd3',
    'chosen',
    'text!templates/form/visualization/colormap.html',
    'tinycolor',
    'jqueryui/widgets/draggable'
], function ($, _, Backbone, BaseForm, module, d3, chosen, ColormapTemplate, tinycolor) {
    "use strict";

    /*
    The purpose of this view is to manage and configure a mapping
    between a number scale and a color map.
    */
    var colormapForm = BaseForm.extend({
        events: {
            'change .tooltip input[type="color"]': 'updateColorScale',
            //'change .tooltip input[type="number"]': 'updateScales',
            'click .top > .tooltip-inner': 'addNumInput',
            'click .color-block': 'addLabelInput',
            'focusout .tooltip input[type="number"]': 'updateValue',
            'focusout .color-block input[type="text"]': 'updateLabel',
            'click .add': 'addStop',
            'click .remove': 'removeStop',
            'chosen:showing_dropdown #scheme-picker': 'applySchemeBackgrounds',
            'change #scheme-picker': 'applySchemeBackgrounds',
        },

        initialize: function(model, appearanceModel) {
            this.model = model;
            this.appearanceModel = appearanceModel;
            this.render(true);
            //this.listenTo(this.model, 'change:colorScaleRange', this.applySchemeBackgrounds);
            this.listenTo(this.model, 'changedMapType', this.rerender);
            this.listenTo(this.model, 'change:units', this.rerender);
            this.listenTo(this.model, 'rerender', this.rerender);
            this.listenTo(this.model, 'change:colorScaleRange', this.rerender);
        },

        addNumInput: function(e) {
            e.stopImmediatePropagation();
            var valueBox;
            if ($(e.currentTarget).children().length > 0) {
                valueBox = $($(e.currentTarget).children()[0]);
            } else {
                valueBox = $('<input>', {type:'number',
                class: 'numberScaleDomain',
                step: 0.001});
                valueBox.prop('value', parseFloat(e.currentTarget.innerText));
                valueBox.attr('value', parseFloat(e.currentTarget.innerText));
                $(e.currentTarget).text('').append(valueBox);
            }
            valueBox.focus();
            valueBox.select();
        },

        addLabelInput: function(e) {
            if (e.target !== e.currentTarget) {
                return;
            }
            e.stopImmediatePropagation();
            if (e.currentTarget.className !== 'color-block'){
                e.currentTarget = e.currentTarget.parentElement;
            }
            $(e.currentTarget).css('color', 'black');
            var idx = parseInt(e.currentTarget.id.split('-')[2]);
            var labelBox = $('<input type=text>');
            var content = '';
            if (this.model.get('colorBlockLabels')[idx] !== '') {
                content = this.model.get('colorBlockLabels')[idx];
            }
            labelBox.prop('value', content);
            labelBox.attr('value', content);
            $(e.currentTarget).text(' ');
            e.currentTarget.append(labelBox[0]);
            labelBox.focus();
            labelBox.select();
        },

        render: function(first) {
            this.$el.append(_.template(ColormapTemplate, {
                model: this.model
            }));

            this.picker = $('#colormap-slider', this.$el);
            if (!_.isUndefined(first)){
                this.picker.resize(_.bind(this.rerender, this));
            }
            this.genSlider();
            //setTimeout(_.bind(this.genSlider, this), 200);
            //this.updateBackground();

            this.schemePicker = $('#scheme-picker', this.$el)
            .on('chosen:ready', _.bind(this.applySchemeBackgrounds, this))
            .chosen({disable_search: true,
                     width: "100%"
            });
        },

        genSlider: function() {
            this.colorBlocks = [];
            this.handles = [];
            this.numberStops = [];
            this.colorStops = [];
            var numberDomain = _.clone(this.model.get('numberScaleDomain'));
            var numberRange = _.clone(this.model.get('numberScaleRange'));
            var colorDomain = this.model.get('colorScaleDomain');
            var colorRange = this.model.get('colorScaleRange');
            var leftBound = 0;
            var width, i, pickerScale;
            if (this.model.get('numberScaleType') === 'linear') {
                pickerScale = d3.scaleLinear()
                    .domain([numberDomain[0], numberDomain[1]])
                    .range([0,this.picker.width()]);
            } else {
                pickerScale = d3.scaleLog()
                    .domain([numberDomain[0], numberDomain[1]])
                    .range([0,this.picker.width()]);
            }
            var stops = this.model.getAllNumberStops();
            // first generate the color blocks.
            for (i = 0; i < stops.length-1; i++) {
                var colorBlock = $('<div></div>', {
                    id: 'color-block-' + i,
                    class: 'color-block'
                });
                colorBlock.css('background-color', colorRange[i]);
                this.updateColorBlockTextColor(colorBlock);
                colorBlock.text(this.model.get('colorBlockLabels')[i]);
                this.colorBlocks.push(colorBlock);
                //set the background color and length
                width = (pickerScale(stops[i+1]) - pickerScale(stops[i]));
                //boundary = (numberDomain[i+1] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100;
                this.colorBlocks[i].css('left', leftBound + 'px');
                this.colorBlocks[i].css('width', width + 'px');
                leftBound += width;

                this.colorStops.push(this.createColorTip(colorRange[i], colorBlock));

                this.picker.append(colorBlock);
            }

            leftBound = 0;
            //generate the handles, and set them up using setupSliderHandles
            for (i = 0; i < stops.length; i++) {
                var handle = $('<div id=#handleIdx-' + i + ' class=slider-handle></div>');
                this.handles.push(handle);
                if (i !== 0 && i !== stops.length-1){
                    handle.addClass('movable');
                }
                width = (pickerScale(stops[i+1]) - pickerScale(stops[i]));
                //boundary = (numberDomain[i+1] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100;
                this.handles[i].css('left', leftBound + 'px');
                leftBound += width;

                this.numberStops.push(this.createNumberTip(stops[i], handle));
                this.picker.append(handle);
            }

            this.$('.slider-handle').draggable({
                containment: 'parent',
                axis: 'x',
                handle: '.tooltip',
                start: _.bind(this.startDragHandler, this),
                stop: _.bind(this.stopDragHandler, this),
                drag: _.bind(this.dragHandler, this)
            }).css('position', '');

        },
/*
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
            this.colorBlocks = [];
            //$(handles[0]).addClass('slider-first');
            //$(handles[handles.length-1]).addClass('slider-last');
            var i;

            if (this.model.get('map_type') === 'continuous') {
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
                    var colorBlock = $('<div class="color-block"><span>&nbsp</span></div>');
                    this.colorBlocks.push(colorBlock);
                    this.colorStops.push(this.createColorTip(this.model.get('colorScaleRange')[i], colorBlock   ));
                    this.picker.append(colorBlock);
                }
            }

            for (i = 1; i < handles.length-1; i++) {
                $(handles[i]).addClass('movable');
            }
        },
*/
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
/*
            if (this.model.get('map_type' === 'discrete')) {
                label = $('<div class="color-bucket-label"></div>');
                colorToolTip.append(label);
            }
*/
            parentElem.append(colorToolTip);

            return colorToolTip;
        },

        getHandleIdx: function(hdl) {
            return parseInt(hdl.attr('id').split('-')[1]);
        },

        dragHandler: function(e, ui) {
            var idx = this.getHandleIdx(ui.helper);
            var diff = ui.position.left - ui.helper.position().left;
            var curr = ui.position.left,
                next = this.handles[idx + 1].position().left,
                prev = this.handles[idx - 1].position().left;
            if (curr > next || curr < prev || !ui.helper) {
                return false;
            }
            var leftBlock = this.colorBlocks[idx-1];
            var rightBlock = this.colorBlocks[idx];
            $(leftBlock).css('width', leftBlock.width() + diff + 'px');
            $(rightBlock).css('left', ui.position.left + 'px');
            $(rightBlock).css('width', rightBlock.width() - diff + 'px');

            var frac = ui.position.left / this.picker.width();
            var csd = this.model.get('colorScaleDomain').slice();
            csd[idx -1] = this.model.numScale.invert(frac);
            this.model.set('colorScaleDomain', csd);
            this.updateNumberTooltip(e, ui);
        },

        startDragHandler: function(e, ui) {
            var idx = this.getHandleIdx(ui.helper);
            this._origHandlePosition = ui.position.left;
            this._origValue = this.model.get('numberScaleDomain')[idx];
        },

        stopDragHandler: function(e, ui) {
            console.log(ui);
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

        _genBackgroundString: function(domain, colors, map_type) {
            //generates and returns a background linear-gradient string
            //domain is an array of numbers on a linear number scale
            var backgroundString = 'linear-gradient(to right, ';
            var i, boundary;

            if (map_type === 'continuous')  {
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
                                                     this.model.get('map_type'));

            if (colorRange.length === 1) {
                this.colorBlocks[0].css('left', '0%');
            }

            if (this.model.get('map_type') === 'discrete') {
                var curbounds = 0;

                for (i = 0; i < colorRange.length - 1; i++) {
                    boundary = (numberDomain[i+1] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100;
                    this.colorBlocks[i].css('left', curbounds + '%');
                    this.colorBlocks[i].css('width', boundary - curbounds + '%');
                    //this.colorBlocks[i].css('left', ((boundary - curbounds) / 2 + curbounds) + '%');
                    curbounds = boundary;
                }

                //this.colorBlocks[i].css('left', ((100 - curbounds) / 2   + curbounds) + '%');
                    this.colorBlocks[i].css('left', curbounds + '%');
                    this.colorBlocks[i].css('width', 100 - curbounds + '%');

            }

            this.picker.css('background', bgString);
        },

        applySchemeBackgrounds: function(e, selected) {
            var genBGString = _.bind(function(name) {
                var len = this.model.get('colorScaleRange').length;
                var colors;
                if (name === 'Custom') {
                    colors = this.model.get('_customScheme');
                } else {
                    colors = this.model._getColors(name, len);
                }
                var bgString = this._genBackgroundString(_.range(0, 1.0/(len)*(len+1), 1.0/(len)), colors, 'discrete');
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
            if (e.currentTarget.value === ""){
                $(e.currentTarget).remove();
                $('.tooltip-inner',
                  this.numberStops[i])
                  .text(this._toDisplayString(this.model.get('colorScaleDomain')[i - 1]));
                return;
            }
            var newVal = (this.model
                          .fromInputConversionFunc(parseFloat(e.currentTarget.value)));
            if (!this.model.setStop(i, newVal)) {
                $(e.currentTarget).remove();
                $('.tooltip-inner',
                  this.numberStops[i])
                  .text(this._toDisplayString(this.model.get('colorScaleDomain')[i - 1]));
            }
        },

        updateColorBlockTextColor(e) {
            var color = e.css('background-color');
            if (tinycolor(color).getLuminance() > 0.179){
                e.css('color', 'black');
            } else {
                e.css('color', 'white');
            }
        },

        updateLabel(e) {
            var idx = parseInt(e.target.parentElement.id.split('-')[2]);
            var labs = this.model.get('colorBlockLabels').slice();
            labs[idx] = e.currentTarget.value;
            this.model.set('colorBlockLabels', labs);
            var block = $(e.target.parentElement);
            block.text(e.currentTarget.value);
            this.updateColorBlockTextColor(block);
            e.target.remove();
        },

        updateNumberTooltip: function(e, ui) {
            var idx = this.getHandleIdx(ui.helper);
            var ttc = $('.top > .tooltip-inner', $(ui.helper));

            if ($('input[type="number"]', ttc).length > 0) {
                $('input[type="number"]', ttc).remove();
            }

            ttc.text(this._toDisplayString(this.model.get('colorScaleDomain')[idx -1]));
        },

        updateColorScale: function(e) {
            var stops = _.clone(this.model.get('colorScaleRange'));

            for (var i = 0; i < this.colorStops.length; i++) {
                if ($('input', this.colorStops[i])[0] === e.currentTarget) {
                    stops[i] = e.currentTarget.value;
                }
            }

            this.model.set('_customScheme', stops);
            this.model.set('scheme', 'Custom', {silent: true});
            this.model.set('colorScaleRange', stops);
        },

        addStop: function(e) {
            this.model.addStop(this.model.get('colorScaleDomain').length);
            this.rerender();
        },

        removeStop: function(e) {
            this.model.removeStop(this.model.get('colorScaleDomain').length - 1);
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
                if (dispValue < 1000) {
                    return Number(dispValue).toPrecision(4);
                } else {
                    return Number(dispValue).toPrecision(5);
                }
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
