define([
    'underscore',
    'backbone',
    'model/base',
    'model/environment/water',
    'model/environment/wind'
], function(_, Backbone, BaseModel, WaterModel, WindModel){
    evaporationWeatherer = BaseModel.extend({
        urlRoot: '/weatherer/',

        model: {
            water: WaterModel,
            wind: WindModel
        },

        defaults: {
            'obj_type': 'gnome.weatherers.Evaporation'
        },

        toTree: function(){
            return '';
        }
    });

    return evaporationWeatherer;
});