define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeStep = BaseModel.extend({
        url: '/step',
    });

    return gnomeStep;
});