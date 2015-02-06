define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/waves'
], function(_, Backbone, BaseModel, WavesModel){
    emulsificationWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Emulsification',
            'name': 'Emulsion'
        },

        model: {
            waves: WavesModel
        },

        toTree: function(){
            return '';
        }
    });

    return emulsificationWeatherer;
});