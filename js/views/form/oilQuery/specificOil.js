define([
    'jquery',
    'underscore',
    'backbone',
    'model/resources/oilLib',
    'text!templates/default/specificOil.html'
], function($, _, Backbone, OilLib, SpecificOilTemplate){
	var specificOil = Backbone.View.extend({
		id: 'specificOilContainer',

		initialize: function(){
			this.render();
		},

		render: function(){
			var data = this.dataParse(this.model.attributes);
			var compiled = _.template(SpecificOilTemplate, {data: data});
			$('#specificOilContainer').html(this.$el.html(compiled));
		},

		dataParse: function(obj){
            var groupAnalysis = ['aromatics',
                                 'polars',
                                 'resins',
                                 'saturates',
                                 'paraffins',
                                 'sulphur',
                                 'benezene', 
                                 'wax_content'
                                 ];
			for (key in obj){
				if (!obj[key]){
					obj[key] = "--";				
				} else if (_.isArray(obj[key])) {
                    if (obj[key].length === 0){
                        if (key === 'cuts' || key === 'kvis'){
                            obj[key] = false;
                        } else {
                            obj[key] = "--";
                        }
                    } else {
    					for (var i = 0; i < obj[key].length; i++){
    						for (k in obj[key][i]) {
    							if (!obj[key][i][k]){
    								obj[key][i][k] = "--";
    							}
    						}
    					}
                    }
                } else if (groupAnalysis.indexOf(key) !== -1){
                    obj[key] = (obj[key] * 100).toFixed(3);
                } else if (key === 'oil_seawater_interfacial_tension' || key === 'oil_water_interfacial_tension') {
                    obj[key] = (obj[key] * 1000).toFixed(3);
                }
			}
			return obj;
		}

	});
	return specificOil;
});