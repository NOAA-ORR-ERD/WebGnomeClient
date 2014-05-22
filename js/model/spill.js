define([
    'underscore',
    'backbone',
    'model/base',
    'model/release',
    'model/element'
], function(_, Backbone, BaseModel, GnomeRelease, GnomeElement){
    var gnomeSpill = BaseModel.extend({
        url: '/spill',

        defaults: {
            'on': true,
            'obj_type': 'gnome.spill.spill.Spill',
            'release': new GnomeRelease(),
            'element_type': new GnomeElement(),
        },

        model: {
            release: GnomeRelease,
            element_type: GnomeElement
        },
    });

    return gnomeSpill;
    
});