define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeEnvironment = BaseModel.extend({
        urlRoot: '/environment/',

    });

    return gnomeEnvironment;
});