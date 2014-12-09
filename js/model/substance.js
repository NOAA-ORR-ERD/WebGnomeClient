define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeSubstance = BaseModel.extend({
        url: function(){
            return webgnome.config.oil_api + '/oil/' + this.get('adios_oil_id');
        },

        defaults: {
            name: 'ALAMO',
            api: 23.3,
            pour_point_max_k: 266.4833,
            flash_point_max_k: 339.97349999999994,
            categories: [{id: 6, name: "Medium", parent_id: 1, children: [], parent: {id: 1, name: "Crude", parent_id: null}}]
        }
    });
    return gnomeSubstance;
});