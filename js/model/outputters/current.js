define([
    'underscore',
    'backbone',
    'model/base',
    'model/movers/cats'
], function(_, Backbone, BaseModel, CatsMover){
    'use strict';
    var currentOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        model: {
            current_movers: {
                'gnome.movers.c_current_movers.CatsMover': CatsMover
            }
        },

        defaults: function(){
            return {
                obj_type: 'gnome.outputters.json.CurrentJsonOutput',
                output_last_step: 'true',
                output_zero_step: 'true',
                current_movers : new Backbone.Collection(),
                on: true,
                name: 'CurrentJsonOutput'
            };
        },

        toTree: function(){
            return '';
        },

        rewindModel: function(){
            // no op on rewind because current_movers can be added and removed on the fly
        }
    });

    return currentOutputter;
});