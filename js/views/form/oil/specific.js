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
			$('.oil-form .modal-body').append(this.$el.html(compiled));
		},

        cToF: function(c){
            return (((c * (9/5)) + 32).toFixed(3));
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
            var tempAttrs = ['pour_point_min_k',
                             'pour_point_max_k',
                             'flash_point_max_k',
                             'flash_point_min_k'
                             ];

			for (var attr in oil){
                // When value of oil attribute is null

				if (!oil[attr] && tempAttrs.indexOf(attr) === -1 && attr.indexOf('emuls') === -1){
					oil[attr] = "--";
				} else if (tempAttrs.indexOf(attr) !== -1){
                    var str;
                    if (oil[attr]){
                        if (attr.indexOf('max') > -1){
                            str = attr.substring(0, attr.length - 6) + '_min_k';
                            if (oil[str] === oil[attr]){
                                oil[str] = '';
                            }
                        } else {
                            str = attr.substring(0, attr.length - 6) + '_max_k';
                            if (oil[str] === oil[attr]){
                                oil[str] = '';
                            }
                        }
                        if (oil['estimated'][attr]){
                            oil[attr] = '<i>' + this.cToF((oil[attr] - 273.15).toFixed(3)) + '</i> &deg;F';
                        } else {
                            oil[attr] = this.cToF((oil[attr] - 273.15).toFixed(3)) + ' &deg;F';
                        }  
                    } else {
                        for (var i = 0; i < tempAttrs.length; i++){
                            if (attr === tempAttrs[i]){
                                if (attr.indexOf('max') > -1){
                                    str = attr.substring(0, attr.length - 6) + '_min_k';
                                    if (oil[str] === oil[attr]){
                                        oil[str] = '';
                                    }
                                } else {
                                    str = attr.substring(0, attr.length - 6) + '_max_k';
                                    if (oil[str] === oil[attr]){
                                        oil[str] = '';
                                    }
                                }
                            }
                        }
                        oil[attr] = null;
                    }
                } else if (attr === 'emuls_constant_max' || attr === 'emuls_constant_min'){
                    if (attr === 'emuls_constant_max'){
                        if (oil[attr] && oil[attr] === oil['emuls_constant_min']){
                            oil['emuls_constant_min'] = '';
                        }
                    }
                } else if (_.isObject(oil[attr]) && !_.isArray(oil[attr])) {
                    for (var key in oil[attr]){
                        if (_.isArray(oil[attr][key]) && oil[attr][key].length === 0){
                            if (key === 'kvis' || key === 'synonyms'){
                                oil[attr][key] = false;
                            }
                        } else if (_.isArray(oil[attr][key])) {
                        // For loop that goes through array
                            for (var i = 0; i < oil[attr][key].length; i++){
                                for (var k in oil[attr][key][i]) {
                                    if (!oil[attr][key][i][k] && oil[attr][key][i] !== 'weathering'){
                                        oil[attr][key][i][k] = "--";
                                    } else if (k === 'ref_temp_k' || k === 'vapor_temp_k' || k === 'liquid_temp_k') {
                                        if (oil['estimated'][attr]){
                                            oil[attr][key][i][k] = (oil[attr][key][i][k] - 273.15).toFixed(3);
                                            var k2 = k.substring(0, k.length - 2) + '_f';
                                            oil[attr][key][i][k2] = '<i>' + this.cToF(oil[attr][key][i][k]).toString() + '</i>';
                                            oil[attr][key][i][k] = '<i>(' + oil[attr][key][i][k] + ')</i>';
                                        } else {
                                            oil[attr][key][i][k] = (oil[attr][key][i][k] - 273.15).toFixed(3);
                                            var k2 = k.substring(0, k.length - 2) + '_f';
                                            oil[attr][key][i][k2] = this.cToF(oil[attr][key][i][k]).toString();
                                            oil[attr][key][i][k] = '(' + oil[attr][key][i][k] + ')';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // When value of oil attribute is of type array
                 else if (_.isArray(oil[attr])) {
                    // When oil attribute is an empty array
                    if (oil[attr].length === 0){
                        if (attr === 'cuts' || attr === 'kvis' || attr === 'synonyms' || attr === 'densities'){
                            oil[attr] = false;
                        } else {
                            oil[attr] = '--';
                        }
                    } else {
                        // For loop that goes through array
    					for (var i = 0; i < oil[attr].length; i++){
    						for (var k in oil[attr][i]) {
    							if (!oil[attr][i][k] && oil[attr][i] !== 'weathering'){
    								oil[attr][i][k] = "--";
    							} else if (k === 'ref_temp_k' || k === 'vapor_temp_k' || k === 'liquid_temp_k') {
                                    if (oil['estimated'][attr]){
                                        oil[attr][i][k] = (oil[attr][i][k] - 273.15).toFixed(3);
                                        var k2 = k.substring(0, k.length - 2) + '_f';
                                        oil[attr][i][k2] = '<i>' + this.cToF(oil[attr][i][k]).toString() + '</i>';
                                        oil[attr][i][k] = '<i>(' + oil[attr][i][k] + ')</i>';
                                    } else {
                                        oil[attr][i][k] = (oil[attr][i][k] - 273.15).toFixed(3);
                                        var k2 = k.substring(0, k.length - 2) + '_f';
                                        oil[attr][i][k2] = this.cToF(oil[attr][i][k]).toString();
                                        oil[attr][i][k] = '(' + oil[attr][i][k] + ')';
                                    }
                                } else if (k === 'kg_m_3'){
                                    if (oil['estimated'][attr]){
                                        oil[attr][i][k] = '<i>' + (oil[attr][i][k] / 1000).toFixed(3) + '</i>';
                                    } else {
                                        oil[attr][i][k] = (oil[attr][i][k] / 1000).toFixed(3);
                                    }
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
                else if (attr === 'oil_seawater_interfacial_tension_n_m' || attr === 'oil_water_interfacial_tension_n_m') {
                    if (oil['estimated'][attr]){
                        oil[attr] = '<i>' + (oil[attr] * 1000).toFixed(3) + '</i>';
                    } else {
                        oil[attr] = (oil[attr] * 1000).toFixed(3);
                    }
                } else if (attr === 'api'){
                    if (oil['estimated'][attr]){
                        oil[attr] = '<i>' + oil[attr].toFixed(3) + '</i>';
                    } else {
                        oil[attr] = oil[attr].toFixed(3);
                    }
                }
			}
			return oil;
		}

	});
	return specificOil;
});