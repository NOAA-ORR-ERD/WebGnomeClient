define([
    'underscore',
    'backbone',
    'models/base',
], function(_, Backbone, BaseModel){
    var wizardNewModel = BaseModel.extend({
        url: '/model',

    });

    return wizardNewModel;
});