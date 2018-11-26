define([
    'underscore',
    'jquery',
    'backbone',
    'd3',
    'tinycolor'
], function(_, $, Backbone, d3, tinycolor){
    'use strict';
    var colormapModel = Backbone.Model.extend({
        defaults: function() {
            return {
                "alphaType": "mass",
                "useAlpha": true,
                "interpolate": false,
                "units": "",
                "scheme": "Custom",
                "endsConfigurable": "none",
                "numberScaleType": "linear",
                "numberScaleDomain": [0,100],
                "numberScaleRange": [0,1],
                "colorScaleType": "threshold",
                "colorScaleDomain": [],
                "colorScaleRange": ['#000000'],
                "_customScheme": ['#000000'],
                "_allSchemes": ['Custom','Greys', 'Category10', 'Dark2', 'Paired', 'Set1', 'Viridis', 'Inferno', 'Magma', 'Plasma', 'Warm', 'Cool', 'CubehelixDefault', 'Reds', 'Purples', 'YlOrBr','YlGnBu', 'PuBuGn', 'RdGy','BrBG','PRGn','PuOr','PiYG','RdYlBu','RdYlGn','Spectral']
            };
        },

        initialize: function(attrs, options) {
            Backbone.Model.prototype.initialize.call(this, attrs, options);
            this.listenTo(this, 'change:colorScaleRange', this._saveCustomScheme);
            this.listenTo(this, 'change:interpolate', this._changeInterpolation);
            this.listenTo(this, 'change:scheme', this._applyScheme);
            this.listenTo(this, 'change', this.initScales);
            this.initScales();
        },

        initScales: function() {
            var domain = this.get('numberScaleDomain');
            if (this.get('numberScaleType') === 'linear') {
                this.numScale = d3.scaleLinear()
                    .domain([domain[0], domain[domain.length-1]])
                    .range([0,1]);
            } else {
                this.numScale = d3.scaleLog()
                    .domain([domain[0], domain[domain.length-1]])
                    .range([0,1]);
            }
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

        setUnitConversionFunction(toDisplay, fromInput) {
            // sets the translation function used when displaying data on the colormap, and receiving data from input fields
            this.toDisplayConversionFunc = toDisplay;
            this.fromInputConversionFunc = fromInput;
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

        setValue(name, index, value) {
            this.get(name)[index] = value;
            this.trigger('change:'+name, {name: this.get(name)});
            this.trigger('change', {name: this.get(name)});
        },

        setStop: function(index, value) {
            //sets the numberScaleDomain value at index to the value specified.
            //returns true if successful, returns false and does not change the value otherwise
            //triggers a change event
            var domain = this.get('numberScaleDomain');
            var curr = domain[index],
                next = domain[index + 1] - 0.01,
                prev = domain[index - 1] + 0.01;
            
            if (value === curr || value > next || value < prev) {
                return false;
            } else {
                domain[index] = value;
                this.trigger('change:numberScaleDomain', {'numberScaleDomain':domain});
                return true;
            }
        },

        setDomain: function(min, max, stops) {
            // This changes the overall scale, using the stops provided to determine where to put new domain values
            // stops is a list of values between 0 and 1
            var domain = this.get('numberScaleDomain');
            if (domain[0] === min && domain[domain.length-1] === max) {
                return;
            }
            domain[0] = min;
            domain[domain.length-1] = max;
            this.initScales();
            var newDomain = [min];
            if (stops) {
                for(var i = 1; i < stops.length-1; i++) {
                    var newVal = this.numScale.invert(stops[i]);
                    newDomain.push(newVal);
                }
                newDomain.push(max);
            } else {
                newDomain.push(max);
            }
            this.set('numberScaleDomain', newDomain);
            this.syncRanges();
        },

        _hardResetStops: function(nStops, interpolate) {
            // This function does a hard edit of the scale, setting it up for the specified number of stops.
            // It does not preserve the previous values, instead spacing them equally.
            var nsd = this.get('numberScaleDomain');
            var nsdStops = [],
                nsrStops = [],
                csdStops = [],
                csrStops = [];
            var max = nsd[nsd.length-1],
                min = nsd[0];
            var silent = {silent: true};
            this.set('interpolate', interpolate, silent);
            for (var i = 0; i < nStops; i++) {
                nsrStops.push(i * 1/(nStops - 1));
                nsdStops.push(min + nsrStops[i] * (max-min));
                if (interpolate) {
                    csdStops.push(nsrStops[i]);
                } else {
                    if (i !== 0 && i !== nStops-1) {
                        csdStops.push(nsrStops[i]);
                    }
                }
                csrStops.push('#FFFFFF');
            }
            if (interpolate) {
                this.set('colorScaleType', 'linear', silent);
            } else {
                this.set('colorScaleType', 'threshold', silent);
                csrStops.pop();
            }
            this.set({
                    'numberScaleDomain': nsdStops,
                    'numberScaleRange': nsrStops,
                    'colorScaleDomain': csdStops,
                    'colorScaleRange': csrStops
                },
                silent
            );

            this._applyScheme();
            this.trigger('change');
        },

        _saveCustomScheme: function() {
            if (this.get('scheme') === 'Custom') { 
                this.set('_customScheme', _.clone(this.get('colorScaleRange')));
            }
        },

        _changeInterpolation: function(e) {
            var nsd = this.get('numberScaleDomain'),
                nsr = this.get('numberScaleRange'),
                csd = this.get('colorScaleDomain'),
                csr = this.get('colorScaleRange');
            if(e && e.changedAttributes() && e.changedAttributes().interpolate) {
                this.set('colorScaleType', 'linear');
                this.removeStop(nsd.length-2, true);
            } else {
                this.set('colorScaleType', 'threshold');
                this.addStop(nsd.length-1, true);
            }
            this.trigger('changedInterpolation');
            this.trigger('change');
        },

        _getd3interpolator: function(name) {
            if ('interpolate' + name in d3) {
                return d3['interpolate'+name];
            } else {
                return name;
            }
        },

        _applyScheme: function(e, scheme) {
            var newScheme;
            if (e) {
                scheme = e.changedAttributes().scheme;
            } else {
                scheme = scheme ? scheme : this.get('scheme');
            }
            newScheme = this._getd3interpolator(scheme);
            if (_.isUndefined(newScheme)) { return; }
            var i;
            var range = this.get('colorScaleRange');
            var colors;
            if (newScheme === scheme) {
                if (scheme === 'Custom') {
                    colors = this.get('_customScheme');
                    for (i = 0; i < range.length; i++) {
                        range[i] = colors[i] ? colors[i] : '#FFFFFF';
                    }
                } else {
                    //categorical schemes. These have strict requirements for length and interpolation
                    if(this.get('interpolate')) {
                        this._changeInterpolation();
                    }
                    newScheme = d3['scheme' + scheme];
                    var maxLen = newScheme.length;
                    if (range.length > maxLen) {
                        this._hardResetStops(maxLen+1, false);
                        return;
                    } else if (this.get('interpolate')) {
                        this._hardResetStops(range.length+1, false);
                        return;
                    } else {
                        for (i = 0; i < range.length; i++) {
                            range[i] = newScheme[i];
                        }
                    }
                }
            } else {
                if (!this.get('interpolate')) {
                    var stops = [];
                    for (i = 0; i < range.length; i++) {
                        stops.push(i * 1/(range.length));
                    }
                    colors = stops.map(function(s) {return tinycolor(newScheme(s)).toHexString();});
                } else {
                    colors = this.get('colorScaleDomain').map(function(s) {return tinycolor(newScheme(s)).toHexString();});
                }
                for (i = 0; i < range.length; i++) {
                    range[i] = colors[i];
                }
            }
            this.trigger('change:colorScaleRange');
            this.trigger('changedInterpolation');
        }
    });
    return colormapModel;
});
