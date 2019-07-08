define([
    'underscore',
    'backbone',
    'model/base',
    'model/initializers/windages'
], function(_, Backbone, BaseModel, Windage){
    'use strict';
    var gnomeSubstance = BaseModel.extend({
        urlRoot: '/substance/',

        model: {
            initializers: Backbone.Collection
        },

        defaults: function() {
            return {
                'obj_type': 'gnome.spill.substance.GnomeOil',
                'initializers': new Backbone.Collection([new Windage()]),
                'is_weatherable': true,
                'standard_density': null,
            };
        },

        oilLibUrl: function(){
            return webgnome.config.oil_api + '/oil/' + this.get('adios_oil_id');
        },

        parseTemperatures: function(){
            var flashPointK = this.get('flash_point_max_k');
            var pourPointK = this.get('pour_point_max_k');

            var flashPointC = flashPointK - 273.15;
            var flashPointF = (flashPointC * (9 / 5)) + 32;

            var pourPointC = pourPointK - 273.15;
            var pourPointF = (pourPointC * (9 / 5)) + 32;

            return {
                    'pour_point_max_c': pourPointC.toFixed(1),
                    'pour_point_max_f': pourPointF.toFixed(1),
                    'flash_point_max_c': flashPointC.toFixed(1),
                    'flash_point_max_f': flashPointF.toFixed(1)
                   };
        },

        fetch: function(options) {
            if (_.isUndefined(options)){
                options = {};
            }
            options.url = this.oilLibUrl();
            return BaseModel.prototype.fetch.call(this, options);
        },

        validate: function(attrs, options){
            // if (_.isUndefined(attrs.bullwinkle_fraction)){
            //     return 'Stable emulsion fraction must be defined!';
            // }

            // if (_.isUndefined(attrs.emulsion_water_fraction_max)){
            //     return 'Emulsion constant must be defined!';
            // }
            
            // if (!_.isNumber(attrs.bullwinkle_fraction) || (attrs.bullwinkle_fraction < 0 || attrs.bullwinkle_fraction > 1)){
            //     return 'Stable emulsion fraction must be a number between zero and one!';
            // }

            // if (!_.isNumber(attrs.emulsion_water_fraction_max) || (attrs.emulsion_water_fraction_max < 0 || attrs.emulsion_water_fraction_max > 1)){
            //     return 'Emulsion constant must be a number between zero and one!';
            // }
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