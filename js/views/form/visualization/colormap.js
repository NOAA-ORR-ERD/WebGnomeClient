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
            'click .top > .tooltip-inner > span': 'addNumInput',
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
            this.topTierSize = 1;
            this.bottomTierSize = 1;
        },

        computeOverallHeight: function() {
            //computes the overall height of the colormap div given the top and bottom tiers, and margins
            // colorbarheight + 3 + 3 (margins) + 30 * (topTier + bottomTier)
            return (30 + 6 + 28 * this.topTierSize + 36 * this.bottomTierSize);
        },

        resizeOverall: function() {
            //resizes the colormap container
            var colormap = $('.colormap', this.$el);
            colormap.css('height', this.computeOverallHeight());
            $('#colormap-slider', colormap).css('margin-top', this.topTierSize * 28);
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
                var spn = $('<span></span>');
                colorBlock.append(spn);
                colorBlock.css('z-index', i);
                colorBlock.css('background-color', colorRange[i]);
                this.updateColorBlockTextColor(colorBlock);
                spn.text(this.model.get('colorBlockLabels')[i]);
                this.colorBlocks.push(colorBlock);
                //set the background color and length
                width = Math.round(pickerScale(stops[i+1]) - pickerScale(stops[i]));
                //boundary = (numberDomain[i+1] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100;
                this.colorBlocks[i].css('left', leftBound + 'px');
                this.colorBlocks[i].css('width', width + 'px');
                leftBound += width;

                this.colorStops.push(this.createColorTip(colorRange[i], colorBlock));

                this.picker.append(colorBlock);
                $('.tooltip-inner', this.colorBlocks[i]).css('width', this.colorBlocks[i].width()*0.667);
            }

            leftBound = 0;
            //generate the handles, and set them up using setupSliderHandles
            for (i = 0; i < stops.length; i++) {
                var handle = $('<div id=#handleIdx-' + i + ' class=slider-handle></div>');
                handle.css('z-index', i + this.colorBlocks.length);
                this.handles.push(handle);
                if (i !== 0 && i !== stops.length-1){
                    handle.addClass('movable');
                }
                if (i % 2 !== 0) {
                    handle.addClass('alt');
                }
                width = Math.round(pickerScale(stops[i+1]) - pickerScale(stops[i]));
                //boundary = (numberDomain[i+1] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100;
                this.handles[i].css('left', leftBound + 'px');
                leftBound += width;

                this.numberStops.push(this.createNumberTip(stops[i], handle));
                this.picker.append(handle);
            }

            this.bottomTierSize = this.tierizeHandles(this.colorBlocks);
            this.topTierSize = this.tierizeHandles(this.handles);

            this.$('.slider-handle').draggable({
                containment: 'parent',
                axis: 'x',
                handle: '.tooltip',
                start: _.bind(this.startDragHandler, this),
                stop: _.bind(this.stopDragHandler, this),
                drag: _.bind(this.dragHandler, this)
            }).css('position', '');
            this.resizeOverall();
        },

        tierizeHandles: function(handles) {
            //Alters a list of handle tooltips through css to avoid overlapping.
            //Assumptions: list of handles must be ASCENDING ORDER. 
            //Algorithm is as follows:
            // 1. For each tooltip rect, find the # overlap to the left (L), and # overlap to the right(R), and store
            //  1a. Overlap means i+1 right <= i left
            // 2. For each i, boost next R rects up one tier (T), set R to 0
            //  2a. Boosting a rect reduces its L by 1, and increases it's T by 1
            //  2b. If rect i+R+1 exists, then Rect i + R has it's R reduced by 1, and i+R+1 has L reduced by 1

            // Alter CSS as necessary given a handle's tier

            //Jay Hennen 11/22/19: Try implementing this through recursion and tier-by-tier collision detection
            
            var hdlToolTip, hdlRect, neighborRect, overlap;
            var tooltips = []; //Apply the CSS to these
            var i, j, k;
            for (i = 0; i < handles.length; i++) {
                hdlToolTip = $('.tooltip', handles[i]);
                hdlToolTip._left = 0;
                hdlToolTip._right = 0;
                hdlToolTip._tier = 1;
                tooltips.push(hdlToolTip);
                hdlRect = $('.tooltip-inner', handles[i])[0].getBoundingClientRect();

                for (j = 0; j < handles.length; j++) {
                    neighborRect = $('.tooltip-inner', handles[j])[0].getBoundingClientRect();
                    overlap = !(
                        hdlRect.right < neighborRect.left || 
                        hdlRect.left > neighborRect.right
                    );
                    if(overlap && i !== j) {
                        if (j < i) {
                            hdlToolTip._left++;
                        } else {
                            hdlToolTip._right++;
                        }
                    }
                }
            }

            var tt, stop, f, fstop;
            for (i = 0; i < tooltips.length; i++) {
                tt = tooltips[i];
                if (tt._right > 0){
                    if (tt._right >= tooltips[i+1]._left) {
                        for (j = i + 1; j < i + tt._right + 1; j++) {
                            tooltips[j]._tier = (tt._tier + 1); //boost the tier
                            tooltips[j]._left--;
                        }
                        tt._right = 0;
                        if (j < tooltips.length) {
                            stop = j - tooltips[j]._left;
                            for (k = j - 1; k >= stop; k--) {
                                tooltips[j]._left--;
                                tooltips[k]._right--;
                            }
                        }
                    } else {
                        tt._right = 0;
                        tooltips[i+1]._left = 0;
                    }
                }
            }
            var maxTier = 0;
            for (i = 0; i < tooltips.length; i++) {
                //if (tooltips[i]._left !== 0 || tooltips[i]._right !== 0) {
                //    console.error('tiering went wrong!!')
                //}
                maxTier = Math.max(maxTier, tooltips[i]._tier);
                if (tooltips[i].hasClass('top')){
                    tooltips[i].css('height', 28 * tooltips[i]._tier);
                    $('.tooltip-line', tooltips[i]).css('height', 30 + 28 * (tooltips[i]._tier - 1));
                } else {
                    tooltips[i].css('margin-top', 3 + 36 * (tooltips[i]._tier - 1));
                }
            }
            return maxTier;
        },

        createNumberTip: function(value, parentElem) {
            var valueToolTip, arrow, line, inner, spn;
            valueToolTip = $('<div></div>',{class: "tooltip top slider-tip"});

            arrow = $('<div></div>',{class: "tooltip-arrow"});
            line = $('<div></div>', {class: "tooltip-line"});
            inner = $('<div></div>',{class: "tooltip-inner"});
            spn = $('<span></span>');

            var dispValue = this._toDisplayString(value);

            spn.text(dispValue);
            inner.append(spn);
            valueToolTip.append(arrow);
            valueToolTip.append(line);
            valueToolTip.append(inner);

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
            //colorToolTip.append(line);
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
            var diff = Math.round(ui.position.left - ui.helper.position().left);
            var curr = ui.position.left,
                next = this.handles[idx + 1].position().left,
                prev = this.handles[idx - 1].position().left;
            if (curr > next || curr < prev || !ui.helper) {
                return false;
            }
            var leftBlock = this.colorBlocks[idx-1];
            var rightBlock = this.colorBlocks[idx];
            $(leftBlock).css('width', leftBlock.width() + diff + 'px');
            $('.tooltip-inner', leftBlock).css('width', leftBlock.width()*0.667);
            $(rightBlock).css('left', Math.round(ui.position.left) + 'px');
            $(rightBlock).css('width', rightBlock.width() - diff + 'px');
            $('.tooltip-inner', rightBlock).css('width', rightBlock.width()*0.667);

            var frac = ui.position.left / this.picker.width();
            var csd = this.model.get('colorScaleDomain').slice();
            csd[idx -1] = this.model.numScale.invert(frac);
            this.model.set('colorScaleDomain', csd);
            this.updateNumberTooltip(e, ui);
        },

        startDragHandler: function(e, ui) {
            var idx = this.getHandleIdx(ui.helper);
            if (idx === 0 || idx === this.handles.length - 1) {
                e.stopPropagation();
                return false;
            }
            this._origHandlePosition = ui.position.left;
            this._origValue = this.model.get('numberScaleDomain')[idx];
        },

        stopDragHandler: function(e, ui) {
            this.bottomTierSize = this.tierizeHandles(this.colorBlocks);
            this.topTierSize = this.tierizeHandles(this.handles);
            this.resizeOverall();
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
                    boundary = Math.round((numberDomain[i+1] - numberDomain[0]) / (numberDomain[numberDomain.length-1] - numberDomain[0]) * 100);
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

        addNumInput: function(e) {
            e.stopImmediatePropagation();
            var spn = $(e.currentTarget);
            spn.hide();
            var inner = spn.parent();
            var valueBox;
            if ($('input', inner).length > 0) {
                valueBox = $('input', inner)[0];
            } else {
                valueBox = $('<input>', {type:'number',
                    class: 'numberScaleDomain',
                    step: 0.001});
                valueBox.on('keyup', function(e){
                    if (e.which === 13){
                        this.blur();
                    }
                });
                valueBox.prop('value', parseFloat(spn.text()));
                valueBox.attr('value', parseFloat(spn.text()));
                inner.append(valueBox);
            }
            valueBox.focus();
            valueBox.select();
        },

        addLabelInput: function(e) {
            if ($(e.target).hasClass('tooltip')) {
                return;
            }
            e.stopImmediatePropagation();
            var cbox = $(e.currentTarget);
            var spn = $('span', cbox);
            var labelBox = $('<input type=text>');
            spn.hide();

            labelBox.prop('value', spn.text());
            labelBox.attr('value', spn.text());
            cbox.append(labelBox);
            labelBox.focus();
            labelBox.select();
        },

        updateValue(e) {
            //this gets the index (i). dirty but effective enough.
            for (var i = 0; i < this.numberStops.length; i++) {
                if (this.numberStops[i].has(e.currentTarget).length > 0) {
                    break;
                }
            }
            var inputBox = $(e.currentTarget);
            var inner = inputBox.parent();
            var spn = $('span', inner);
            if (inputBox.val() !== ""){
                var newVal = this.model.fromInputConversionFunc(parseFloat(inputBox.val()));
                if (this.model.setStop(i, newVal)) {
                    return;
                }
            }
            inputBox.remove();
            spn.text(this._toDisplayString(this.model.getAllNumberStops()[i]));
            spn.show();
            return;
        },

        updateColorBlockTextColor(e) {
            var bgcolor = e.css('background-color');
            var spn = $('span',e);
            if (tinycolor(bgcolor).getLuminance() > 0.179){
                spn.css('color', 'black');
            } else {
                spn.css('color', 'white');
            }
        },

        updateLabel(e) {
            var inputBox = $(e.currentTarget);
            var cbox = inputBox.parent();
            var spn = $('span', cbox);
            var idx = parseInt(cbox.prop('id').split('-')[2]);
            var labs = this.model.get('colorBlockLabels').slice();
            labs[idx] = inputBox.val();
            this.model.set('colorBlockLabels', labs);
            spn.text(inputBox.val());
            this.updateColorBlockTextColor(cbox);
            inputBox.remove();
            spn.show();
        },

        updateNumberTooltip: function(e, ui) {
            var idx = this.getHandleIdx(ui.helper);
            var ttc = $('.top > .tooltip-inner', $(ui.helper));

            if ($('input[type="number"]', ttc).length > 0) {
                $('input[type="number"]', ttc).remove();
                $('span', ttc).show();
            }

            $('span', ttc).text(this._toDisplayString(this.model.get('colorScaleDomain')[idx -1]));
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
                } else if (dispValue < 10000000) {
                    return Number.parseInt(dispValue, 10);
                } else {
                    return Number(dispValue).toPrecision(4);
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
