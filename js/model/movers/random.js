define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var randomMover = BaseModel.extend({
        urlRoot: '/mover/',

        defaults: {
            obj_type: 'gnome.movers.random_movers.RandomMover'
        },

    });

    return randomMover;
});