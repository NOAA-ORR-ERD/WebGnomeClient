define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    dispersionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Dispersion',
            'name': 'Dispersion'
        },

        toTree: function(){
            return '';
        }
    });

    return dispersionWeatherer;
});