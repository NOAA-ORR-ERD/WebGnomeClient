define([
    'underscore',
    'backbone',
    'nucos',
    'model/base'
], function(_, Backbone, nucos, BaseModel){
    'use strict';
    var waterModel = BaseModel.extend({
        urlRoot: '/environment/',
        defaults: {
            obj_type: 'gnome.environment.water.Water',
            temperature: null,
            salinity: 32,
            sediment: 5,
            wave_height: null,
            fetch: null,
            units: {
                'temperature': 'F',
                'salinity': 'psu',
                'sediment': 'mg/l',
                'wave_height': 'ft',
                'fetch': 'mi',
                'kinematic_viscosity': 'm^2/s',
                'density': 'kg/m^3'
            },
            kinematic_viscosity: 1
        },

        validate: function(attrs, options){
            var temp_bounds = {
                upper: 313.15,
                lower: 271.15
            };

            var temp_units = attrs.units.temperature;
            var temp_lower_bound = nucos.convert('Temperature', 'K', temp_units, temp_bounds.lower).toFixed(2);
            var temp_upper_bound = nucos.convert('Temperature', 'K', temp_units, temp_bounds.upper).toFixed(2);

            if (attrs.salinity < 0 || attrs.salinity === ''){
                return 'Salinity must be a number greater than or equal to zero!';
            }

            if (attrs.salinity > 42){
                return 'Salinity must be a number less than or equal to 42!';
            }

            if (attrs.sediment < 0 || attrs.sediment === ''){
                return 'Sediment load must be a number greater than or equal to zero!';
            }

            if(_.isNull(attrs.temperature) || (attrs.temperature < parseFloat(temp_lower_bound) || attrs.temperature > parseFloat(temp_upper_bound))){
                return 'Water temperature must be between ' + temp_lower_bound + ' \xB0' + temp_units + ' and ' + temp_upper_bound + ' \xB0' + temp_units + '!';
            }

            if (!_.isNull(attrs.wave_height) && (parseFloat(attrs.wave_height) < 0 || attrs.wave_height.length === 0)){
                return 'Wave height must be a number greater than or equal to zero!';
            }

            if (nucos.convert('Length', attrs.units.wave_height, 'm', attrs.wave_height) > 15.5){
                var upperBound = Math.round(nucos.convert('Length', 'm', attrs.units.wave_height, 15.5) * 10)/10;
                return 'Wave height cannot be greater than ' + upperBound + ' ' + attrs.units.wave_height + '!';
            }

            if (!_.isNull(attrs.fetch) && (parseFloat(attrs.fetch) < 0 || attrs.fetch.length === 0)){
                return 'Fetch must be a number greater than or equal to zero!';
            }
            var concentUpperBound = nucos.convert('Concentration In Water', 'kg/m^3', attrs.units.sediment, 1);
            if (attrs.sediment > concentUpperBound){
                return 'Sediment cannot exceed ' + concentUpperBound + ' ' + attrs.units.sediment + '!';
            }

        },

        getDensity: function(){
            var temp = this.get('temperature');
            var units = this.get('units').temperature;
            var salinity = this.get('salinity');
            if (units === 'F') {
                temp = nucos.convert('temperature','F','C',temp);
            }
            return nucos.waterDensity().calcDensity(temp, salinity);
        }

    });

    return waterModel;
});

