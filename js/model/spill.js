define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeSpills = BaseModel.extend({
        defaults: {
            'on': true,
            'obj_type': 'gnome.spill.spill.Spill',
            'element_type': {
                'obj_type': 'gnome.spill.elements.ElementType',
                'initializers': {
                    'windages': {

                    }
                }
            }
        }
    });

    return gnomeSpills;
    
});