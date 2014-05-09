define([
    'underscore',
    'backbone',
    'model/base',
], function(_, Backbone, BaseModel){
    var gnomeElement = BaseModel.extend({
        url: '/element',

        defaults: {
            'obj_type': 'gnome.spill.elements.ElementType',
        }
    });

    return gnomeElement;
    
});