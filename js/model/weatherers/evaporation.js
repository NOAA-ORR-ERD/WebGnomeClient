define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    evaporationWeatherer = BaseModel.extend({
        urlRoot: '/weatherer/',

        defaults: {
            'obj_type': 'gnome.weatherers.Evaporation'
        },

        toTree: function(){
            return '';
        }
    });

    return evaporationWeatherer;
});