define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    emulsificationWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Emulsification',
            'name': 'Emulsion'
        },

        toTree: function(){
            return '';
        }
    });

    return emulsificationWeatherer;
});