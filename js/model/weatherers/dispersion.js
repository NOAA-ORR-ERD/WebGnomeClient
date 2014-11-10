define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    dispersionWeatherer = BaseModel.extend({
        urlRoot: '/weatherer/',

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