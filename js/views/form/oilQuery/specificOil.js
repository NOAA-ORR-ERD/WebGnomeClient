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
			var data = this.model.attributes;
			var compiled = _.template(SpecificOilTemplate, {data: data});
			$('.modal-body').html(compiled);
		},

		dataParse: function(obj){
			for (key in obj){
				key = key.replace(/(^| )(\w)/g, String.toUpperCase);
			}
			return obj;
		}
	});
	return specificOil;
});