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
                'wave_height': 'm',
                'fetch': 'm',
                'kinematic_viscosity': 'm^2/s',
                'density': 'kg/m^3'
            },
            kinematic_viscosity: 1
        },

        validate: function(attrs, options){
            if (attrs.salinity < 0 || attrs.salinity === ''){
                return 'Salinity must be greater than or equal to zero!';
            }
            if (attrs.sediment_load < 0 || attrs.sediment_load === ''){
                return 'Sediment load must be greater than or equal to zero!';
            }

            if(attrs.water_temp < 270.928 || attrs.water_temp > 308.706){
                return 'Water temperature must be a reasonable degree.';
            }
        }

    });

    return waterModel;
});

