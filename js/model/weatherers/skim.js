define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    skimWeatherer = BaseModel.extend({
        urlRoot: '/weatherer/',

        defaults: {
            'obj_type': 'gnome.weatherers.Skimmer'
        },

        toTree: function(){
            return '';
        }
    });

    return skimWeatherer;
});