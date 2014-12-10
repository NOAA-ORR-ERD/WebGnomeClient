define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    burnWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Burn',
            'name': 'Burn'
        },

        toTree: function(){
            return '';
        }
    });

    return burnWeatherer;
});