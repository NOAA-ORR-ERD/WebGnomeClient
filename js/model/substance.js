define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeSubstance = BaseModel.extend({
        defaults: {
            name: 'ALAMO',
            api: 23.3,
            pour_point_max_k: 266.4833,
            flash_point_max_k: 339.97349999999994
        }
    });
    return gnomeSubstance;
});