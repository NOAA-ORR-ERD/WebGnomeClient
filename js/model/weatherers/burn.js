define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    burnWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Burn',
            'name': 'Burn'
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