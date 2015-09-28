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
            obj_type: 'gnome.environment.environment.Water',
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

        convertToK: function(temp){
            if (this.get('units').temperature === 'F'){
                temp = (temp - 32) * (5.0 / 9);
            }
            if (this.get('units').temperature !== 'K'){
                temp = parseFloat(temp) + 273.15;
            }
            return temp;
        },

        validate: function(attrs, options){
            if (attrs.salinity < 0 || attrs.salinity === ''){
                return 'Salinity must be a number greater than or equal to zero!';
            }

            if (attrs.sediment < 0 || attrs.sediment === ''){
                return 'Sediment load must be a number greater than or equal to zero!';
            }

            if(!_.isNull(attrs.temperature) && (this.convertToK(attrs.temperature) < 271.15 || this.convertToK(attrs.temperature) > 313.15)){
                return 'Water temperature must be a reasonable degree.';
            }

            if (attrs.wave_height === ''){
                return 'A value for wave height must be inputted!';
            }

            if (attrs.wave_height < 0){
                return 'Wave height must be a number greater than or equal to zero!';
            }

            if (nucos.convert('Length', attrs.units.wave_height, 'm', attrs.wave_height) > 15.5){
                var upperBound = Math.round(nucos.convert('Length', 'm', attrs.units.wave_height, 15.5));
                return 'Wave height cannot be greater than ' + upperBound + ' ' + attrs.units.wave_height + '!';
            }

            if (attrs.fetch === ''){
                return 'A value for fetch must be inputted!';
            }

            if (attrs.fetch < 0){
                return 'Fetch must be a number greater than or equal to zero!';
            }

            if (attrs.sediment > 1000){
                return 'Sediment cannot exceed 1000 milligrams per liter!';
            }

        },

        getDensity: function(){
            var temp = this.get('temperature');
            var salinity = this.get('salinity');

            return nucos.waterDensity().calcDensity(temp, salinity);
        }

    });

    return waterModel;
});

