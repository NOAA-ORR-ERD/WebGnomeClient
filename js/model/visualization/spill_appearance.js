//A model that stores appearance settings for various objects.

define([
        'underscore',
        'nucos',
        'model/visualization/appearance',
        'model/visualization/colormap'
], function(_, nucos, BaseAppearance, ColorMap){
    'use strict';
    var SpillAppearanceModel = BaseAppearance.extend({
        defaults: function() { return {
            pin_on: true,
            les_on: true,
            scale: 1,
            data: 'Mass',
            colormap: new ColorMap(),
            units: 'kg',
            ctrl_names: {title:'Spill Appearance',
                         pin_on: 'Show Pin',
                         les_on: 'Show Oil',
                         scale: 'Scale',
                        },
            _available_data: ['Mass', 'Surface Concentration', 'Age', 'Viscosity', 'Depth']
            };
        },

        initialize: function(model) {
            BaseAppearance.prototype.initialize.call(this, model);
            this.listenTo(this.get('colormap'), 'change', this.save);
            this.listenTo(this.get('colormap'), 'change', function(v){this.trigger('change', this);});
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
            } else if (data === 'Surface Concentration') {
                newUnits = '';
            } else if (data === 'Age') {
                newUnits = 'hrs';
            } else if (data === 'Viscosity') {
                newUnits = 'cSt';
            } else if (data === 'Depth') {
                newUnits = 'm';
            } else {
                return;
            }
            this.set('units', newUnits);
        },

        setUnitConversionFunction: function(e, newUnits) {
            // sets the translation function used when displaying data on the colormap, and receiving data from input fields
            if (e) {
                if (e.changedAttributes().units) {
                    newUnits = e.changedAttributes().units;
                }  
            }
            var toDisplay, fromInput;
            var data = this.get('data');
            if (data === 'Mass') {
                fromInput = _.bind(function(value) {
                    var c = new nucos.OilQuantityConverter();
                    var spill = webgnome.model.get('spills').findWhere({'_appearance': this});
                    return c.Convert(value, newUnits, spill.get('element_type').get('standard_density'), 'kg/m^3', 'kg');
                }, this);
                toDisplay = _.bind(function(value) {
                    var c = new nucos.OilQuantityConverter();
                    var spill = webgnome.model.get('spills').findWhere({'_appearance': this});
                    return c.Convert(value, 'kg', spill.get('element_type').get('standard_density'), 'kg/m^3', newUnits);
                }, this);
            } else if (data === 'Age') {
                fromInput = _.bind(function(value) {
                    return nucos.Converters.time.Convert(newUnits, 'sec', value);
                }, this);
                toDisplay = _.bind(function(value) {
                    return nucos.Converters.time.Convert('sec', newUnits, value);
                }, this);
            } else if (data ==='Viscosity') {
                fromInput = _.bind(function(value) {
                    return nucos.Converters.kinematicviscosity.Convert(newUnits, 'cSt', value);
                }, this);
                toDisplay = _.bind(function(value) {
                    return nucos.Converters.kinematicviscosity.Convert('cSt', newUnits, value);
                }, this);
            } else if (data ==='Depth') {
                fromInput = _.bind(function(value) {
                    return nucos.Converters.length.Convert(newUnits, 'm', value);
                }, this);
                toDisplay = _.bind(function(value) {
                    return nucos.Converters.length.Convert('m', newUnits, value);
                }, this);
            } else {
                fromInput = function(value) {return value;};
                toDisplay = function(value) {return value;};
            }
            this.get('colormap').setUnitConversionFunction(toDisplay, fromInput);
            this.get('colormap').set('units', newUnits);
        },

        updateSpillJsonOutputter: function(dtype) {
            var output = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'});
            if(dtype !== 'Viscosity' || dtype !== 'Surface Concentration') {
                this.get('colormap').set('numberScaleType', 'linear');
            }
            output._updateRequestedDataTypes(dtype);
        },

        save: function(attrs, options) {
            if(this.get('id')) {
                var json = this.toJSON();
                json.colormap = this.get('colormap').toJSON();
                this.appearance_cache.setItem(this.get('id') + '_appearance', json);
            }
        },

        fetch: function(options) {
            return new Promise(_.bind(function(resolve, reject) {
                this.appearance_cache.getItem(this.get('id') + '_appearance').then(
                    _.bind(function(attrs) {
                        if (attrs && attrs.colormap) {
                            this.get('colormap').set(attrs.colormap);
                            attrs.colormap = this.get('colormap');
                            this.set(attrs);
                            resolve(attrs);
                        } else {
                            resolve(attrs);
                        }
                    }, this)
                );
            }, this));
        }

    });
    return SpillAppearanceModel;
});
