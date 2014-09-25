define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var waterModel = BaseModel.extend({
        urlRoot: '/environment/',
        defaults: {
            obj_type: 'gnome.environment.water.Water',
            water_temp: 46,
            water_unit: 'F',
            salinity: 32,
            sediment_load: 5,
            sea_height: 'compute'
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

