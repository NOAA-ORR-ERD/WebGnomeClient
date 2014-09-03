define([
    'jquery',
    'underscore',
    'backbone',
    'model/resources/oilLib',
    'text!templates/default/specificOil.html'
], function($, _, Backbone, OilLib, SpecificOilTemplate){
	var specificOil = Backbone.View.extend({
		id: 'specificOil',

		initialize: function(){
			this.render();
		},

		render: function(){
			var data = this.dataParse(this.model.attributes);
			var compiled = _.template(SpecificOilTemplate, {data: data});
			$('.modal-body').html(compiled);
            $('.collapse').collapse({toggle: false});
		},

		dataParse: function(obj){
			for (key in obj){
				if (!obj[key]){
					obj[key] = "N/A";				
				} else if (_.isArray(obj[key])) {
					for (var i = 0; i < obj[key].length; i++){
						for (k in obj[key][i]) {
							if (!obj[key][i][k]){
								obj[key][i][k] = "N/A";
							}
						}
					}
				}
			}
			return obj;
		}
	});
	return specificOil;
});