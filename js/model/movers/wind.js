define([
    'underscore',
    'backbone',
    'model/base',
    'model/environment/wind'
], function(_, Backbone, BaseModel, GnomeWind){
    var windMover = BaseModel.extend({
        urlRoot: '/movers/',

        defaults: {
            obj_type: 'gnome.movers.wind_movers.WindMover'
        },

        model: {
            wind: GnomeWind
        }
    });

    return windMover;
});