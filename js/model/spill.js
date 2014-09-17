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
            'release': null,
            'element_type': null,
            'name': 'Spill'
        },

        model: {
            release: GnomeRelease,
            element_type: GnomeElement
        },

        validate: function(attrs, options){
            if(!attrs.release.isValid()){
                return attrs.release.validationError;
            }

            if(!attrs.element_type.isValid()){
                return attr.element_type.validationError;
            }

            if(isNaN(attrs.amount)){
                return 'Amount must be a number';
            } else if (attrs.amount < 0) {
                return 'Amount must be a positive number';
            }

        }
    });

    return gnomeSpill;
    
});