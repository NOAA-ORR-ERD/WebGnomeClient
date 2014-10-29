define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeSubstance = BaseModel.extend({
        defaults: {
            name: 'ALAMO'
        }
    });
    return gnomeSubstance;
});