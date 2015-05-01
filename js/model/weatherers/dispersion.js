define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/waves'
], function(_, Backbone, BaseModel, WavesModel){
    dispersionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.cleanup.ChemicalDispersion',
            'name': 'Dispersion',
            'efficiency': null
        },

        model: {
            waves: WavesModel
        },

        toTree: function(){
            return '';
        }
    });

    return dispersionWeatherer;
});