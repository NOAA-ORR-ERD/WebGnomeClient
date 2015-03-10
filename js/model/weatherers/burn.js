define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    burnWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Burn',
            'name': 'Burn',
            'area': 0,
            'thickness': 0,
            'area_units': 'm^2',
            'thickness_units': 'cm'
        },

        toTree: function(){
            return '';
        },

        validate: function(attrs, options){
            if (!_.isNumber(parseFloat(attrs.area)) || isNaN(parseFloat(attrs.area))){
                return "Enter a number for boomed area!";
            }
            
            if (!_.isNumber(parseFloat(attrs.thickness)) || isNaN(parseFloat(attrs.thickness))){
                return "Enter a number for thickness!";
            }
        }
    });

    return burnWeatherer;
});