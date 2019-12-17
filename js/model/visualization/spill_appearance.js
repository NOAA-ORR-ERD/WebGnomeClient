//A model that stores appearance settings for various objects.
define([
        'underscore',
        'nucos',
        'model/visualization/appearance',
        'model/visualization/colormap'
], function(_, nucos, BaseAppearance, ColorMap){
    'use strict';

    var SpillAppearanceModel = BaseAppearance.extend({

        model: {
            colormap: ColorMap
        },

        defaults: function() { return {
            obj_type: 'gnome.utilities.appearance.SpillAppearance',
            pin_on: true,
            les_on: true,
            scale: 1,
            data: 'Mass',
            colormap: new ColorMap({units: 'kg'}),
            units: 'kg',
            preset_scales: [{name: 'Response Relevant',
                             data: 'Surface Concentration',
                             units: 'g/m^2',
                             colormap: {
                                "units": 'g/m^2',
                                "numberScaleType": "log",
                                "numberScaleDomain": [0.0001,0.25],
                                "numberScaleRange": [0,1],
                                "colorScaleType": "threshold",
                                "colorScaleDomain": [0.05, 0.1],
                                "colorScaleRange": ["#fdbea0", "#fb6b40", "#b5211c"],
                                "scheme": "Reds",
                                "colorBlockLabels": ['Light', 'Medium', 'Heavy'],
                                },
                            },
                            {name: 'Biologically Relevant',
                             data: 'Surface Concentration',
                             units: 'g/m^2',
                             colormap: {
                                "units": 'g/m^2',
                                "numberScaleType": "log",
                                "numberScaleDomain": [0.0001,0.05],
                                "numberScaleRange": [0,1],
                                "colorScaleType": "threshold",
                                "colorScaleDomain": [0.001, 0.01],
                                "colorScaleRange": ["#fdbea0", "#fb6b40", "#b5211c"],
                                "scheme": "Reds",
                                "colorBlockLabels": ['Light', 'Medium', 'Heavy'],
                                },
                            },
                            {name: 'Response Relevant',
                             data: 'Viscosity',
                             units: 'cst',
                             colormap: {
                                "units": 'cst',
                                "numberScaleType": "log",
                                "numberScaleDomain": [0.0001,0.0500],
                                "numberScaleRange": [0,1],
                                "colorScaleType": "threshold",
                                "colorScaleDomain": [0.0020, 0.0150, 0.0200, 0.0300],
                                "colorScaleRange": ["#fdc3a7", "#fb895f", "#fa4118", "#b5211c", "#760b0f"],
                                "scheme": "Reds",
                                "colorBlockLabels": ['', '', '', '', ''],
                                },
                            },
                            {name: 'Detailed',
                             data: 'Viscosity',
                             units: 'cst',
                             colormap: {
                                "units": 'cst',
                                "numberScaleType": "log",
                                "numberScaleDomain": [0.0001,0.1000],
                                "numberScaleRange": [0,1],
                                "colorScaleType": "threshold",
                                "colorScaleDomain": [0.0020, 0.0050, 0.0075, 0.0100, 0.0150, 0.0200],
                                "colorScaleRange": ["#1f77b4", "#2ca02c", "#bcbd22", "#ff7f0e", "#9467bd","#d62728", "#000000"],
                                "scheme": "Custom",
                                "colorBlockLabels": ['', '', '', '', '', '', '', ''],
                                },
                            }],
            ctrl_names: {
                         pin_on: 'Spill Location',
                         les_on: 'Particles',
                         scale: 'Particle Size',
                         },
            _available_data: ['Mass',
                              'Surface Concentration',
                              'Age',
                              'Viscosity']
                              //Depth
            };
        },

        initialize: function(attrs, options) {
            BaseAppearance.prototype.initialize.call(this, attrs, options);

            //this.listenTo(this.get('colormap'), 'change', this.save);
            //this.listenTo(this.get('colormap'), 'change', function(v){this.trigger('change', this);});
            this.listenTo(this, 'change', this.updateSpillJsonOutputter);
            this.listenTo(this, 'change:data', this.updateSpillJsonOutputter);
            this.listenTo(this, 'change:data', this.setDefaultUnits);
            this.listenTo(this, 'change:units', this.setUnitConversionFunction);

            this.setUnitConversionFunction(undefined, this.get('units'));
        },

        setDefaultUnits: function(e) {
            var data = e.changedAttributes().data;
            var newUnits;

            if (data === 'Mass') {
                newUnits = 'kg';
            }
            else if (data === 'Surface Concentration') {
                newUnits = 'g/m^2';
            }
            else if (data === 'Age') {
                newUnits = 'hrs';
            }
            else if (data === 'Viscosity') {
                newUnits = 'cSt';
            }
            else if (data === 'Depth') {
                newUnits = 'm';
            }
            else {
                return;
            }

            this.set('units', newUnits);
        },

        setUnitConversionFunction: function(e, newUnits) {
            // sets the translation function used when displaying data
            // on the colormap, and receiving data from input fields
            if (e) {
                if (e.changedAttributes().units) {
                    newUnits = e.changedAttributes().units;
                }
            }

            var toDisplay, fromInput;
            var data = this.get('data');
            var spill = (webgnome.model.get('spills')
                         .findWhere({'_appearance': this}));
            var colormap = this.get('colormap');
            if (_.isUndefined(spill)) {
                fromInput = function(value) {return value;};
                toDisplay = function(value) {return value;};
                this.get('colormap').setUnitConversionFunction(toDisplay,
                                                           fromInput);
                return;
            }

            if (data === 'Mass') {
                var sd = spill.get('substance').get('standard_density');
                fromInput = _.bind(function(value) {
                    var c = new nucos.OilQuantityConverter();

                    return c.Convert(value, newUnits, sd,
                                     'kg/m^3', 'kg');
                }, this);

                toDisplay = _.bind(function(value) {
                    var c = new nucos.OilQuantityConverter();

                    return c.Convert(value, 'kg', sd,
                                     'kg/m^3', newUnits);
                }, this);
            }
            else if (data === 'Age') {
                fromInput = _.bind(function(value) {
                    return nucos.Converters.time.Convert(newUnits, 'sec', value);
                }, this);

                toDisplay = _.bind(function(value) {
                    return nucos.Converters.time.Convert('sec', newUnits, value);
                }, this);
            }
            else if (data ==='Viscosity') {
                fromInput = _.bind(function(value) {
                    return (nucos.Converters.kinematicviscosity
                            .Convert(newUnits, 'm^2/s', value));
                }, this);

                toDisplay = _.bind(function(value) {
                    return (nucos.Converters.kinematicviscosity
                            .Convert('m^2/s', newUnits, value));
                }, this);
            }
            else if (data ==='Depth') {
                fromInput = _.bind(function(value) {
                    return nucos.Converters.length.Convert(newUnits, 'm', value);
                }, this);

                toDisplay = _.bind(function(value) {
                    return nucos.Converters.length.Convert('m', newUnits, value);
                }, this);
            }
            else if (data ==='Surface Concentration') {
                //Convert to and from percentages
                fromInput = _.bind(function(value) {
                    //return nucos.Converters.length.Convert(newUnits, 'kg/m^2', value);
                    // Nucos doesn't support these units, so do manually
                    if (newUnits === 'kg/m^2'){
                        return value;
                    } else {
                        return value / 1000;
                    }
                }, this);

                toDisplay = _.bind(function(value) {
                    //surf_conc->percentage
                    //value = nucos.Converters.length.Convert('kg/m^2', newUnits, value);
                    var maxconc = colormap.get('numberScaleDomain')[1];
                    if (newUnits !== 'kg/m^2'){
                        value = value * 1000;
                        maxconc = maxconc * 1000;
                    }
                    var percent = (Number(value / maxconc * 100)
                                   .toPrecision(3));
                    //return percent + "%\n" + Number(value).toPrecision(3);
                    return value; //Number(value).toPrecision(3);
                }, this);
            }
            else {
                fromInput = function(value) {return value;};
                toDisplay = function(value) {return value;};
            }

            this.get('colormap').setUnitConversionFunction(toDisplay,
                                                           fromInput);
            this.get('colormap').set('units', newUnits);
        },

        updateSpillJsonOutputter: function(dtype) {
            var output = (webgnome.model.get('outputters')
                          .findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'}));

            if (dtype.get('data') !== 'Viscosity' && dtype.get('data') !== 'Surface Concentration') {
                this.get('colormap').set('numberScaleType', 'linear');
            }

            output._updateRequestedDataTypes(dtype);
        }
    });

    return SpillAppearanceModel;
});
