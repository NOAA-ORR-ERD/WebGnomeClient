define([
    'underscore',
    'backbone',
    'model/base',
    'model/release',
    'model/element'
], function(_, Backbone, BaseModel, GnomeRelease, GnomeElement){
    var gnomeSpill = BaseModel.extend({
        urlRoot: '/spill/',

        defaults: {
            'on': true,
            'obj_type': 'gnome.spill.spill.Spill',
            'release': GnomeRelease,
            'element_type': GnomeElement,
        },

        model: {
            release: GnomeRelease,
            element_type: GnomeElement
        },
    });

    return gnomeSpill;
    
});