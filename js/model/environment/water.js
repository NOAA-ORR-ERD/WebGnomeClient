define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var waterModel = BaseModel.extend({
        urlRoot: '/environment/',
        defaults: {
        	obj_type: 'gnome.environment.water.Water'
        },

        validate: function(attrs, options){
        	if (!isNaN(parseFloat(attrs.water_temp)) && !isNaN(parseFloat(attrs.salinity)) && !isNaN(parseFloat(attrs.sediment_load)) && !isNaN(parseFloat(attrs.sea_height))){
	        	if (attrs.water_temp <= 0) {
	        		return "Water temperature cannot be at or below absolute zero!";
	        	}
	        	if (attrs.salinity < 0){
	        		return "Salinity must be greater than or equal to zero!";
	        	}
	        	if (attrs.sediment_load < 0){
	        		return "Sediment load must be greater than or equal to zero!";
	        	}
	        	if (attrs.sea_height < 0){
	        		return "Sea height must be a positive quantity!";
	        	}
	        } else {
	        	return "Values inputted must be numbers and cannot be left blank!";
	        }
        }

    });

    return waterModel;
});

