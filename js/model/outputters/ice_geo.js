define([
    'underscore',
    'backbone',
    'model/base',
    'model/movers/ice'
], function(_, Backbone, BaseModel, IceMover){
    'use strict';
    var iceOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        model: {
            ice_movers: {
                'gnome.movers.c_current_movers.IceMover': IceMover
            }
        },

        defaults: function(){
            return {
                obj_type: 'gnome.outputters.geo_json.IceGeoJsonOutput',
                name: 'IceGeoJsonOutput',
                output_last_step: 'true',
                output_zero_step: 'true',
                ice_movers : new Backbone.Collection(),
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

    return iceOutputter;
});