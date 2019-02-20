/*
define([
    'underscore',
    'backbone',
    'model/base',
    'model/initializers/windages',
    'model/spill/substance'
], function(_, Backbone, BaseModel, GnomeWindages, GnomeSubstance){
    'use strict';
    var gnomeElement = BaseModel.extend({
        urlRoot: '/element_type/',

        model: {
            substance: GnomeSubstance,
            initializers: {
                'gnome.spill.elements.initializers.InitWindages': GnomeWindages
            }
        },

        defaults: {
            'obj_type': 'gnome.spill.elements.ElementType',
            'substance': null,
            'initializers': new Backbone.Collection([
                new GnomeWindages()
            ])
        },

        validate: function(attrs, options){
            if (attrs.substance && !attrs.substance.isValid()){
                return attrs.substance.validationError;
            }
        },

        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var attrs = [];
            var name = this.get('name');

            attrs.push({title: 'Name: ' + name, key: 'Name', obj_type: this.get('name'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        }
    });

    return gnomeElement;

});
*/