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
            pour_point_max_k: 266.483,
            flash_point_max_k: 339.973,
            categories: [{id: 6, name: "Medium", parent_id: 1, children: [], parent: {id: 1, name: "Crude", parent_id: null}}]
        },

        parseTemperatures: function(){
            var flashPointK = this.get('flash_point_max_k');
            var pourPointK = this.get('pour_point_max_k');

            var flashPointC = flashPointK - 273.15;
            var flashPointF = (flashPointC * (9 / 5)) + 32;

            var pourPointC = pourPointK - 273.15;
            var pourPointF = (pourPointC * (9 / 5)) + 32;

            return {'pour_point_max_c': pourPointC.toFixed(3),
                    'pour_point_max_f': pourPointF.toFixed(3),
                    'flash_point_max_c': flashPointC.toFixed(3),
                    'flash_point_max_f': flashPointF.toFixed(3)
                   };
        },

        parseCategories: function(){
            var cats = this.get('categories');
            var output = [];
            for(var c in cats){
                output.push(cats[c].parent.name + ' - ' + cats[c].name);
            }
            return output;
        }
    });
    return gnomeSubstance;
});