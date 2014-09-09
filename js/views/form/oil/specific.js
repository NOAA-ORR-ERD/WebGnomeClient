define([
    'jquery',
    'underscore',
    'backbone',
    'model/oil/library',
    'text!templates/oil/specific.html'
], function($, _, Backbone, OilLib, SpecificOilTemplate){
	var specificOil = Backbone.View.extend({
		id: 'specificOilContainer',

		initialize: function(){
			this.render();
		},

		render: function(){
			var data = this.dataParse(this.model.attributes);
			var compiled = _.template(SpecificOilTemplate, {data: data});
			$('.modal-body').append(this.$el.html(compiled));
		},

		dataParse: function(oil){
            var groupAnalysis = ['aromatics',
                                 'polars',
                                 'resins',
                                 'saturates',
                                 'paraffins',
                                 'sulphur',
                                 'benezene',
                                 'wax_content'
                                 ];
			for (attr in oil){

                // When value of oil attribute is null

				if (!oil[attr]){
					oil[attr] = "--";				
				}
                // When value of oil attribute is of type array
                 else if (_.isArray(oil[attr])) {
                    // When oil attribute is an empty array
                    if (oil[attr].length === 0){
                        if (attr === 'cuts' || attr === 'kvis' || attr === 'synonyms' || attr === 'densities'){
                            oil[attr] = false;
                        } else {
                            oil[attr] = "--";
                        }
                    } else {
                        // For loop that goes through array
    					for (var i = 0; i < oil[attr].length; i++){
    						for (k in oil[attr][i]) {
    							if (!oil[attr][i][k] && oil[attr][i] !== 'weathering'){
    								oil[attr][i][k] = "--";
    							}
    						}
    					}
                    }
                } 
                // Checks if oil attribute is one of the group analysis terms and if so converts to percent
                else if (groupAnalysis.indexOf(attr) !== -1){
                    oil[attr] = (oil[attr] * 100).toFixed(3);
                } 
                // Checks if oil attribute is one of the interfacial tensions and if so converts to cSt
                else if (attr === 'oil_seawater_interfacial_tension' || attr === 'oil_water_interfacial_tension') {
                    oil[attr] = (oil[attr] * 1000).toFixed(3);
                }
			}
			return oil;
		}

	});
	return specificOil;
});