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
            if (this.get('adios_oil_id')){
                return webgnome.config.oil_api + '/gnome_oil/' + this.get('adios_oil_id');
            }
            else{
                return;
            }
            //return webgnome.config.oil_api + '/gnome_oil/' + this.get('adios_oil_id');
        },

        parseTemperatures: function(){
            var flashPointK = this.get('flash_point');
            var pourPointK = this.get('pour_point');

            if (flashPointK == null){
                var flashPointC = '----';
                var flashPointF = '----';
            }
            else{
                var flashPointC = (flashPointK - 273.15).toFixed(1);
                var flashPointF = ((flashPointC * (9 / 5)) + 32).toFixed(1);
            }
            //var flashPointC = flashPointK - 273.15;
            //var flashPointF = (flashPointC * (9 / 5)) + 32;

            var pourPointC = pourPointK - 273.15;
            var pourPointF = (pourPointC * (9 / 5)) + 32;

            pourPointC = pourPointC.toFixed(1);
            pourPointF = pourPointF.toFixed(1);

            return {
                    'pour_point_max_c': pourPointC,
                    'pour_point_max_f': pourPointF,
                    'flash_point_max_c': flashPointC,
                    'flash_point_max_f': flashPointF
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