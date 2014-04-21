define([
    'underscore',
    'backbone',
    'models/base'
], function(_, Backbone, BaseModel){
    var gnomeModel = BaseModel.extend({
        url: '/model',
        
    });

    return gnomeModel;
});