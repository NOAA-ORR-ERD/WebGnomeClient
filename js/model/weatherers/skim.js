define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    skimWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Skimmer',
            'name': 'Skimmer',
            'efficiency': 0.20
        },

        toTree: function(){
            return '';
        }
    });

    return skimWeatherer;
});