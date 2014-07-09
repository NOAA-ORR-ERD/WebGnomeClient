define([
    'underscore',
    'backbone',
    'model/base',
], function(_, Backbone, BaseModel, GnomeWind){
    var randomMover = BaseModel.extend({
        urlRoot: '/movers/',

        defaults: {
            obj_type: 'gnome.movers.random_movers.RandomMover'
        }
    });

    return randomMover;
});