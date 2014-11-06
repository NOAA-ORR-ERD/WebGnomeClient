define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    burnWeatherer = BaseModel.extend({
        urlRoot: '/weatherer/',

        defaults: {
            'obj_type': 'gnome.weatherers.Burn'
        },

        toTree: function(){
            return '';
        }
    });

    return burnWeatherer;
});