define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var windModel = BaseModel.extend({
        urlRoot: '/environment/'
    });

    return windModel;
});