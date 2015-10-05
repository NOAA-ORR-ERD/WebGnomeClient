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
                'gnome.movers.current_movers.CatsMover': CatsMover
            }
        },

        defaults: function(){
            return {
                obj_type: 'gnome.outputters.geo_json.CurrentGeoJsonOutput',
                name: 'Outputter',
                output_last_step: 'true',
                output_zero_step: 'true',
                current_movers : new Backbone.Collection(),
                on: true
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