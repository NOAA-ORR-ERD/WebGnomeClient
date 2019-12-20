define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'views/base',
    'module',
    'text!templates/default/legend.html',
    'moment',
    'tinycolor'
], function ($, _, Backbone, Cesium, BaseView, module, LegendTemplate, moment, tinycolor) {
    "use strict";
    var legendView = BaseView.extend({
        className: 'legend',
        events: {
            'click .title': 'toggleLegendPanel',
            'click .legend-edit-btn': 'render'
        },

        initialize: function(options){
            this.module = module;
            this.listedItems = [];
            BaseView.prototype.initialize.call(this, options);
            this.render();
            if(webgnome.hasModel() && this.modelMode !== 'adios'){
                this.modelListeners();
            }
        },

        render: function() {
            //Render HTML
            this.$el.html(_.template(LegendTemplate,
                                     {model: webgnome.model,
                                      legend: this
                                     }
            ));
        },

        rerender: function() {
            this.$el.html('');
            for (var i = 0; i < this.listedItems.length; i++) {
                this.stopListening(this.listedItems[i]);
            }
            this.listedItems = [];
            this.render();
        },

        toggleLegendPanel: function(){
            this.$el.toggleClass('expanded');
        },

        modelListeners: function(){
            this.listenTo(webgnome.model.get('movers'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('environment'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('spills'), 'change add remove', this.render);
            this.listenTo(webgnome.model, 'change', this.render);
        },

        genSpillLegendItem(spill) {
            var appearance = spill.get('_appearance');
            appearance.setUnitConversionFunction(undefined, appearance.get('units'));
            var colormap = appearance.get('colormap');

            var item = $('<div class=spill-legend-item></div>');
            var name = $('<div class=spill-row-name>'+ spill.get('name') +'</div>');
            var sub;
            if (spill.get('substance')) {
                sub = spill.get('substance').get('name');
            } else {
                sub = 'Non Weathering Substance';
            }
            var substance = $('<div class=spill-row-substance>' + sub + '</div>');
            var entryRows = $('<div class=spill-legend-entry></div>');
            var attrCol = $('<div class=spill-attr-col><div>Total: '+spill.get('amount')+ ' ' + spill.get('units')+ '</div><div>Displaying: ' + appearance.get('data') + '</div><div>Units: ' + colormap.get('units') + '</div></div>');
            var stopCol = $('<div class=spill-stop-col></div>');
            entryRows.append(attrCol, stopCol);
            item.append(name, substance, entryRows);

            var numColors = 1;
            numColors = colormap.get('colorScaleRange').length;
            var stops = colormap.getAllNumberStops()
            var color = colormap.get('colorScaleRange')[0];
            var p1, p2;
            var label = colormap.get('colorBlockLabels')[0];
            if (label === '') { //&nbsp;
                p1 = this._toDisplayString(stops[0], colormap);
                p2 = this._toDisplayString(stops[1], colormap);
                label = '<' + p1 + ' - ' + p2;
                if (numColors === 1) {
                    label = label + '+';
                }
            }
            
            var bkt = $('<div class="spill-color-bucket" style="background-color: '+ color +'">'+ label +'</div>');
            if (tinycolor(color).getLuminance() > 0.179){
                bkt.css('color', 'black');
            } else {
                bkt.css('color', 'white');
            }
            stopCol.append(bkt);
            //stopCol.append($('<div class="spill-color-bucket" style="background-color: '+ color +'"><div>'+ label +'</div></div>'));
            for (var i = 1; i < numColors; i++) {
                label = colormap.get('colorBlockLabels')[i];
                if (label === '') { //&nbsp;
                    p1 = this._toDisplayString(stops[i], colormap);
                    p2 = this._toDisplayString(stops[i+1], colormap);
                    label = p1 + ' - ' + p2;
                    if (i === numColors - 1) {
                        label = label + '+';
                    }
                }

                color = colormap.get('colorScaleRange')[i];
                bkt = $('<div class="spill-color-bucket" style="background-color: '+ color +'">'+ label +'</div>');
                if (tinycolor(color).getLuminance() > 0.179){
                    bkt.css('color', 'black');
                } else {
                    bkt.css('color', 'white');
                }
                stopCol.append(bkt);

                //stopCol.append($('<div class="spill-color-bucket" style="background-color: '+ color +'"><div>'+ label +'</div></div>'));
            }
            this.listenTo(colormap, 'change', this.rerender);
            //this.listenTo(colormap, 'change:colorBlockLabels', this.rerender);
            //this.listenTo(colormap, 'change:colorScaleRange', this.rerender);
            //this.listenTo(colormap, 'change:units', this.rerender);
            //this.listenTo
            this.listedItems.push(colormap);
            return item[0].outerHTML;
        },

        _toDisplayString(value, colormap) {
            //from the colormap form
            var dispValue = colormap.toDisplayConversionFunc(value);

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
/*
        genSpillLegendItem(spill) {
            var item = $('<tr></tr>');
            var row = $('<tr></tr>');
            var appearance = spill.get('_appearance');
            var colormap = appearance.get('colormap');
            var numberDomain = colormap.get('numberScaleDomain').slice();
            var colorDomain = colormap.get('colorScaleDomain').slice();
            var numColors = 1;
            if (colormap.get('map_type') === 'discrete') {
                numColors = colormap.get('colorScaleRange').length;
            }
            row.append($('<th class="spill-row-name" rowspan=' + numColors + '>'+ spill.get('name') +'<br><span>(' + appearance.get('data') + ') (' + colormap.get('units') + ')</span></th>'));
            var color = colormap.get('colorScaleRange')[0];
            var stops = _.clone(numberDomain);
            var p1, p2;
            var args = [1, 0].concat(colorDomain);
            Array.prototype.splice.apply(stops, args);
            var label = colormap.get('colorBlockLabels')[0];
            if (label === '') { //&nbsp;
                p1 = this._toDisplayString(colormap.toDisplayConversionFunc(stops[0]));
                p2 = this._toDisplayString(colormap.toDisplayConversionFunc(stops[1]));
                label = '<' + p1 + ' - ' + p2;
                if (numColors === 1) {
                    label = label + '+';
                }
            }
            row.append($('<td class="spill-color-bucket" style="background-color: '+ color +'"><span>'+ label +'</span></td>'));
            item.append(row);
            for (var i = 1; i < numColors; i++) {
                label = colormap.get('colorBlockLabels')[i];
                if (label === '') { //&nbsp;
                    p1 = this._toDisplayString(colormap.toDisplayConversionFunc(stops[i]));
                    p2 = this._toDisplayString(colormap.toDisplayConversionFunc(stops[i+1]));
                    label = p1 + ' - ' + p2;
                    if (i === numColors - 1) {
                        label = label + '+';
                    }
                }
                color = colormap.get('colorScaleRange')[i];
                item.append($('<tr><td class="spill-color-bucket" style="background-color: '+ color +'"><span>'+ label +'</span></td></tr>'));
            }
            this.listenTo(colormap, 'change', this.rerender);
            //this.listenTo(colormap, 'change:colorBlockLabels', this.rerender);
            //this.listenTo(colormap, 'change:colorScaleRange', this.rerender);
            //this.listenTo(colormap, 'change:units', this.rerender);
            //this.listenTo
            this.listedItems.push(colormap);
            return item[0].outerHTML;
        }
*/
    });
    return legendView;
});