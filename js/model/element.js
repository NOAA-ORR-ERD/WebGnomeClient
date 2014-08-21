define([
    'underscore',
    'backbone',
    'model/base',
    'model/initializers/windages'
], function(_, Backbone, BaseModel, GnomeWindages){
    var gnomeElement = BaseModel.extend({
        url: '/element_type',

        defaults: {
            'json_': 'webapi',
            'obj_type': 'gnome.spill.elements.ElementType',
            'initializers': [
                {
                    'json_': 'save',
                    'windage_range': [
                         0.01,
                         0.04
                    ],
                    'obj_type': 'gnome.spill.elements.InitWindages',
                    'windage_persist': 900
                }
            ]
        },

        validate: function(){
            
        }
    });

    return gnomeElement;
    
});