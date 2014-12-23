define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var waterModel = BaseModel.extend({
        urlRoot: '/environment/',
        defaults: {
            obj_type: 'gnome.environment.Water',
            temperature: 46,
            salinity: 32,
            sediment: 5,
            wave_height: 0,
            fetch: 0,
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
                return 'Salinity must be greater than or equal to zero!';
            }
            if (attrs.salinity < 0){
                return 'Salinity must be greater than or equal to zero!';
            }
            if (attrs.sediment_load < 0 || attrs.sediment_load === ''){
                return 'Sediment load must be greater than or equal to zero!';
            }

            if(this.convertToK(attrs.temperature) < 271.15 || this.convertToK(attrs.temperature) > 313.15){
                return 'Water temperature must be a reasonable degree.';
            }
        }

    });

    return waterModel;
});

