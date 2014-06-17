define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeMap = BaseModel.extend({
        urlRoot: '/map/',

        validate: function(attrs, options){
            if(_.isNull(attrs.filename)){
                return 'A BNA/GeoJSON/JSON file must be associated with the model.';
            }
        }
    });

    return gnomeMap;
});