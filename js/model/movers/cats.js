define([
    'underscore',
    'backbone',
    'model/base',
    'model/environment/tide'
], function(_, Backbone, BaseModel, GnomeTide){
    var currentMover = BaseModel.extend({
        urlRoot: '/mover/',

        defaults: {
            obj_type: 'gnome.movers.current_movers.CatsMover'
        },

        model: {
            tide: GnomeTide
        }
    });

    return currentMover;
});