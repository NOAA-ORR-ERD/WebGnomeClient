define([
    'underscore',
    'backbone',
    'model/base',
    'model/movers/ice'
], function(_, Backbone, BaseModel, IceMover){
    iceOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        model: {
            ice_movers: {
                'gnome.movers.current_movers.IceMover': IceMover
            }
        },

        defaults: function(){
            return {
                obj_type: 'gnome.outputters.geo_json.IceGeoJsonOutput',
                name: 'Outputter',
                output_last_step: 'true',
                output_zero_step: 'true',
                ice_movers : new Backbone.Collection(),
                on: true
            };
        },

        toTree: function(){
            return '';
        }
    });

    return iceOutputter;
});