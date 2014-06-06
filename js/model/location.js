define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeLocation = BaseModel.extend({
        urlRoot: '/location/',
    });

    return gnomeLocation;
});