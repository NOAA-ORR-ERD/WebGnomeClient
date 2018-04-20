define([
    'underscore',
    'jquery',
    'backbone',
    'd3',
    'tinycolor'
], function(_, $, Backbone, d3, tinycolor){
    'use strict';
    var colormapModel = Backbone.Model.extend({
        defaults: {
            "datum": "Mass",
            "alphaType": "mass",
            "useAlpha": true,
            "interpolate": false,
            "scheme": "Custom",
            "endsConfigurable": "none",
            "numberScaleType": "linear",
            "numberScaleDomain": [0,50,100],
            "numberScaleRange": [0,0.5,1],
            "colorScaleType": "threshold",
            "colorScaleDomain": [0.5],
            "colorScaleRange": ['#000000','#000000'],
            "_customScheme": ['#000000','#000000'],
            "_allSchemes": ['Custom','Greys', 'Category10', 'Reds', 'Purples', 'YlOrBr','YlGnBu', 'PuBuGn', 'RdGy','BrBG','PRGn','PuOr','PiYG','RdYlBu','RdYlGn','Spectral']
        },

        initialize: function(attrs, options) {
            Backbone.Model.prototype.initialize.call(this, attrs, options);
            this.listenTo(this, 'change:colorScaleRange', this._saveCustomScheme);
            this.listenTo(this, 'change:interpolate', this._changeInterpolation);
            this.listenTo(this, 'change:scheme', this._applyScheme);
        },

        syncRanges: function(silent) {
            var stops = this.get('numberScaleRange');
            if (stops.length !== this.get('numberScaleDomain').length) {
                stops = [];
                for (var i = 0; i < this.get('numberScaleDomain').length; i++) {
                    stops.push(i * 1/(this.get('numberScaleDomain').length - 1));
                }
                this.set('numberScaleRange', stops, {silent:silent});
                if (this.get('interpolate')) {
                    this.set('colorScaleDomain', stops, {silent:silent});
                } else {
                    this.set('colorScaleDomain', stops.slice(1, stops.length-1), {silent:silent});
                }
            }
        },

        addStop: function(index, single) {
            var arr;
            var newVal = index < 1 ? 
                this.get('numberScaleDomain')[0] :
                (this.get('numberScaleDomain')[index] + this.get('numberScaleDomain')[index-1]) / 2;
            arr = this.get('numberScaleDomain');
            arr.splice(index, 0, newVal);
            this.syncRanges(true);
            if (!single) {
                var range = this.get('colorScaleRange');
                range.splice(index, 0, range[index]);
                this._saveCustomScheme();
                this._applyScheme();
            }
        },

        removeStop: function(index, single) {
            var arr = this.get('numberScaleDomain');
            arr.splice(index,1);
            this.syncRanges(true);
            if (!single) {
                var range = this.get('colorScaleRange');
                range.splice(index, 1);
                this._saveCustomScheme();
                this._applyScheme();
            }
        },

        _saveCustomScheme: function() {
            if (this.get('scheme') === 'Custom') { 
                this.set('_customScheme', _.clone(this.get('colorScaleRange')));
            }
        },

        _getd3Scheme: function(name) {
            if ('interpolate' + name in d3) {
                return d3['interpolate'+name];
            } else if ('scheme' + name in d3){
                return d3['interpolate' + name];
            } else {
                return name;
            }
        },

        _changeInterpolation: function(e) {
            var nsd = this.get('numberScaleDomain'),
                nsr = this.get('numberScaleRange'),
                csd = this.get('colorScaleDomain'),
                csr = this.get('colorScaleRange');
            if(e.changedAttributes() && e.changedAttributes()['interpolate']) {
                this.set('colorScaleType', 'linear');
                this.removeStop(nsd.length-2, true);
            } else {
                this.set('colorScaleType', 'threshold');
                this.addStop(nsd.length-1, true);
            }
            this.trigger('changedInterpolation');
            this.trigger('change');
        },

        _applyScheme: function(e, scheme) {
            var newScheme;
            if (e) {
                newScheme = this._getd3Scheme(e.changedAttributes().scheme);
            } else {
                newScheme = scheme ? scheme : this.get('scheme');
                newScheme = this._getd3Scheme(newScheme);
            }
            if (_.isUndefined(newScheme)) { return; }
            var i;
            var range = this.get('colorScaleRange');
            var colors;
            if (newScheme === 'Custom') {
                var colors = this.get('_customScheme');
                for (i = 0; i < range.length; i++) {
                    range[i] = colors[i] ? colors[i] : '#FFFFFF';
                }
            } else {
                if (!this.get('interpolate')) {
                    var stops = [];
                    for (var i = 0; i < range.length; i++) {
                        stops.push(i * 1/(range.length - 1));
                    }
                    colors = stops.map(function(s) {return tinycolor(newScheme(s)).toHexString();})
                } else {
                    colors = this.get('colorScaleDomain').map(function(s) {return tinycolor(newScheme(s)).toHexString();})
                }
                for (i = 0; i < range.length; i++) {
                    range[i] = colors[i];
                }
/*
                if (range.length > newScheme.length) {
                    colors = _.clone(newScheme[newScheme.length]);
                    for (i = 0; i < range.length - newScheme.length; i++) {
                        colors.push('#FFFFFF');
                    }
                } else if (range.length < 3) {
                    colors = _.clone(newScheme[3]);
                    range[0] = colors[0];
                    range[1] = colors[2];
                } else {
                    colors = _.clone(newScheme[range.length]);
                    for (i = 0; i < range.length; i++) {
                        range[i] = colors[i];
                    }
                }
*/
            }
            this.trigger('change:colorScaleRange');
        }
    });
    return colormapModel;
});
