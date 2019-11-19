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
                "map_type": 'discrete',
                "units": "",
                "scheme": "Custom",
                "endsConfigurable": "none",
                "numberScaleType": "linear",
                "numberScaleDomain": [0,100],
                "numberScaleRange": [0,1],
                "colorScaleType": "threshold",
                "colorScaleDomain": [],
                "colorScaleRange": ['#000000'],
                "colorBlockLabels": ['',],
                "_customScheme": ['#000000'],
                //add new discrete schemes as arrays of hex strings
                "_discreteSchemes": ['Custom', 'Greys', 'Reds', 'Blues', 'Purples', 'YlOrBr','Dark2'],
                "_continuousSchemes": ['Viridis', 'Inferno', 'Magma', 'Plasma', 'Warm', 'Cool']
            };
        },

        initialize: function(attrs, options) {
            Backbone.Model.prototype.initialize.call(this, attrs, options);
            this.listenTo(this, 'change:colorScaleRange', this._saveCustomScheme);
            this.listenTo(this, 'change:map_type', this._changeMapType);
            this.listenTo(this, 'change:scheme', this._applyScheme);
            this.listenTo(this, 'change', this.initScales);
            this.initScales();
            this.setUnitConversionFunction(function(value) {return value;}, function(value) {return value;});
        },

        initScales: function() {
            var domain = this.get('numberScaleDomain');
            if (this.get('numberScaleType') === 'linear') {
                this.numScale = d3.scaleLinear()
                    .domain([domain[0], domain[1]])
                    .range([0,1]);
            } else {
                this.numScale = d3.scaleLog()
                    .domain([domain[0], domain[1]])
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
                if (this.get('map_type') === 'continuous') {
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
            var newVal;
            var csd = this.get('colorScaleDomain').slice();
            var nsd = this.get('numberScaleDomain').slice();
            var labels = this.get('colorBlockLabels').slice();
            var stops = this.getAllNumberStops();
            if (index === 0 && csd.length === 0) {
                newVal = this.numScale.invert(0.5);
            } else {
                var existingStopFrac = this.numScale(stops[index]);
                var nextStopFrac = index > stops.length ? 1 : this.numScale(stops[index+1]);
                var newStopFrac = existingStopFrac + ((nextStopFrac - existingStopFrac) / 2);
                newVal = this.numScale.invert(newStopFrac);
            }
            csd.splice(index, 0, newVal);
            labels.splice(index+1, 0, '');
            this.set('colorScaleDomain', csd);
            this.set('colorBlockLabels', labels);
            var csr = this.get('colorScaleRange').slice();
            csr.splice(index + 1, 0, "#FFFFFF");
            this.set('colorScaleRange', csr, {silent: true});
            this._saveCustomScheme();
            this._applyScheme();
        },

        removeStop: function(index, single) {
            var arr = this.get('colorScaleDomain').slice();
            var labels = this.get('colorBlockLabels').slice();
            arr.splice(index, 1);
            labels.splice(index+1, 1);
            var range = this.get('colorScaleRange').slice();
            range.splice(index+1, 1);
            this.set({'colorScaleDomain': arr,
                      'colorScaleRange': range,
                      'colorBlockLabels': labels});
            this._saveCustomScheme();
            this._applyScheme();
        },

        setValue(name, index, value) {
            var a = 1/0;
            this.get(name)[index] = value;
            //this.trigger('change:'+name, {name: this.get(name)});
            //this.trigger('change', {name: this.get(name)});
        },

        setStop: function(index, value) {
            //sets the colorScaleDomain value at index to the value specified.
            //returns true if successful, returns false and does not change the value otherwise
            //triggers a change event
            var colorDomain = this.get('colorScaleDomain').slice();
            var numberDomain = this.get('numberScaleDomain').slice();
            var domain = this.getAllNumberStops();
            var curr = domain[index],
                next = domain[index + 1] - 0.01,
                prev = domain[index - 1] + 0.01;

            if (value === curr || value > next || value < prev) {
                return false;
            } else {
                colorDomain[index - 1] = value;
                this.set('colorScaleDomain', colorDomain);
                this.trigger('rerender');
                return true;
            }
        },

        setDomain: function(min, max, newScaleType) {
            var i;
            var stops = [];
            var csd = this.get('colorScaleDomain').slice();
            for (i = 0; i < csd.length; i++) {
                stops.push(this.numScale(csd[i]));
            }

            var domain = this.get('numberScaleDomain').slice();
            if (domain[0] === min && domain[domain.length-1] === max) {
                return;
            }
            domain[0] = min;
            domain[1] = max;
            this.set('numberScaleDomain', domain);
            this.set('numberScaleType', newScaleType, {silent:true});
            this.initScales();
            var newcsd = [];
            for(i = 0; i < stops.length; i++) {
                var newVal = this.numScale.invert(stops[i]);
                newcsd.push(newVal);
            }
            this.set('colorScaleDomain', newcsd);
        },

        _hardResetStops: function(nStops, map_type) {
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
            this.set('map_type', map_type, silent);
            for (var i = 0; i < nStops; i++) {
                nsrStops.push(i * 1/(nStops - 1));
                nsdStops.push(this.numScale.invert(nsrStops[i]));//min + nsrStops[i] * (max-min));
                if (map_type === 'continuous') {
                    csdStops.push(nsrStops[i]);
                } else {
                    if (i !== 0 && i !== nStops-1) {
                        csdStops.push(nsrStops[i]);
                    }
                }
                csrStops.push('#FFFFFF');
            }
            if (map_type === 'continuous') {
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

        getAllNumberStops: function() {
            var numberDomain = this.get('numberScaleDomain').slice();
            var colorDomain = this.get('colorScaleDomain').slice();
            if (this.get('map_type') === 'discrete') {
                var args = [1, 0].concat(colorDomain);
                Array.prototype.splice.apply(numberDomain, args);
                return numberDomain;
            } else {
                return colorDomain;
            }
        },

        _saveCustomScheme: function() {
            if (this.get('scheme') === 'Custom') {
                this.set('_customScheme', _.clone(this.get('colorScaleRange')));
            }
        },

        _changeMapType: function(e) {
            var nsd = this.get('numberScaleDomain'),
                nsr = this.get('numberScaleRange'),
                csd = this.get('colorScaleDomain'),
                csr = this.get('colorScaleRange');
            if(this.get('map_type') === 'continuous') {
                this.set('colorScaleType', 'linear');
                this.set('scheme', this.get('_continuousSchemes')[0]);
                this._hardResetStops(5, 'continuous');
                //this.removeStop(nsd.length-2, true);
            } else {
                this.set('colorScaleType', 'threshold');
                this._hardResetStops(2, 'discrete');
                this.set('scheme', 'Custom');
                //this.addStop(nsd.length-1, true);
            }
            this.trigger('changedMapType');
            //this.trigger('change');
        },

        _getColors: function(name, length) {
            var colors;
            if ('scheme' + name in d3) {
                var scheme = _.clone(d3['scheme'+name]);
                if (_.isString(scheme[0])) {
                    var ns = [undefined]
                    for (var i = 1; i < 10; i++) {
                        ns[i] = scheme.slice(0,i)
                    }
                    scheme = ns
                } else {
                    for (var k = 0; k < scheme.length; k++){
                        if(_.isUndefined(scheme[k])){
                            continue;
                        }
                        scheme[k] = _.clone(scheme[k]);
                        for (var m = 0; m < scheme[k].length; m++){
                            scheme[k][m] = tinycolor(scheme[k][m]).darken(10).toString();
                        }
                    }
                }

                if (length > scheme.length - 1) {
                    //switch to interpolator
                    var d3interp = d3['interpolate'+name];
                    var range = _.range(0, 1.0/(length)*(length+1), 1.0/(length-1));
                    colors = range.map(function(s) {return tinycolor(d3interp(s)).toHexString();});
                } else if (_.isUndefined(scheme[length])){
                    var smallestScheme;
                    for (var i = 0; i < scheme.length; i++) {
                        if (!_.isUndefined(scheme[i])){
                            smallestScheme = scheme[i];
                            break;
                        }
                    }
                    colors = smallestScheme.slice(smallestScheme.length - length, smallestScheme.length);
                } else {
                    colors = scheme[length];
                }
                return colors;
            } else {
                console.error('this scheme doesnt exist');
            }
        },

        _applyScheme: function(e, scheme) {
            var newScheme;
            if (e) {
                scheme = e.changedAttributes().scheme;
            } else {
                scheme = scheme ? scheme : this.get('scheme');
            }
            var colors, i;
            var range = this.get('colorScaleRange').slice();
            if (scheme === 'Custom') {
                colors = this.get('_customScheme');
                for (i = 0; i < range.length; i++) {
                    range[i] = colors[i] ? colors[i] : '#FFFFFF';
                }
                this.set('colorScaleRange', range);
                return;
            } else {
                colors = this._getColors(scheme, range.length);
                this.set('colorScaleRange', colors);
                return;
            }
        }
    });
    return colormapModel;
});
