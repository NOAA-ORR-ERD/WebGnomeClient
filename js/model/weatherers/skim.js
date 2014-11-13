define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    skimWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Skimmer',
            'name': 'Skimmer'
        },

        toTree: function(){
            return '';
        }
    });

    return skimWeatherer;
});