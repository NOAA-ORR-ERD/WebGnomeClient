define([
    'underscore',
    'backbone',
    'models/base'
], function(_, Backbone, BaseModel){
    var model = BaseModel.extend({
        url: '/model',
        
    });

    return model;
});