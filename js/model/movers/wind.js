define([
    'underscore',
    'backbone',
    'model/base',
    'model/environment/wind'
], function(_, Backbone, BaseModel, GnomeWind){
    var windMover = BaseModel.extend({
        model: {
            wind: GnomeWind
        }
    });

    return windMover;
});