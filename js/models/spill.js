define([
    'underscore',
    'backbone',
    'models/base'
], function(_, Backbone, BaseModel){
    var gnomeSpill = BaseModel.extend({

        defaults: {
            'object_type': 'gnome.map.MapFromBNA',
            'filename' : null,
            'refloat_halflife': 1.0
        },

        validate: function(attrs, options){
            if(_.isNull(attrs.filename)){
                return 'A BNA/GeoJSON/JSON file must be associated with the model.';
            }
        }
    });

    return gnomeSpill;
});