define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var tideModel = BaseModel.extend({
        urlRoot: '/environment/'
    });

    return tideModel;
});