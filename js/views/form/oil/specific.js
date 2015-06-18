define([
    'jquery',
    'underscore',
    'backbone',
    'model/oil/library',
    'text!templates/oil/specific.html'
], function($, _, Backbone, OilLib, SpecificOilTemplate){
    'use strict';
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
            return (((c * (9/5)) + 32).toFixed(2));
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
                        var celsius = (oil[attr] - 273.15).toFixed(2);
                        if (oil.estimated[attr]){
                            oil[attr] = '<code>' + this.cToF(celsius) + ' (' + celsius + ')</code> &deg;F (&deg;C)';
                        } else {
                            oil[attr] = this.cToF(celsius) + ' (' + celsius + ') &deg;F (&deg;C)';
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
                } else if (attr === 'bullwinkle_fraction'){
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + oil[attr] + '</code>';
                    }
                } else if (_.isObject(oil[attr]) && !_.isArray(oil[attr])) {
                    for (var key in oil[attr]){
                        if (_.isArray(oil[attr][key]) && oil[attr][key].length === 0){
                            if (key === 'kvis' || key === 'synonyms'){
                                oil[attr][key] = false;
                            }
                        } else if (_.isArray(oil[attr][key])) {
                        // For loop that goes through array
                            for (var o = 0; o < oil[attr][key].length; o++){
                                for (var k in oil[attr][key][o]) {
                                    if (!oil[attr][key][o][v] && oil[attr][key][o] !== 'weathering'){
                                        oil[attr][key][o][v] = "--";
                                    } else if (k === 'ref_temp_k' || k === 'vapor_temp_k' || k === 'liquid_temp_k') {
                                        var k2;
                                        if (oil.estimated[attr]){
                                            oil[attr][key][o][v] = (oil[attr][key][o][v] - 273.15).toFixed(3);
                                            k2 = k.substring(0, k.length - 2) + '_f';
                                            oil[attr][key][o][k2] = '<code>' + this.cToF(oil[attr][key][o][v]).toString() + '</code>';
                                            oil[attr][key][o][v] = '<code>(' + oil[attr][key][o][v] + ')</code>';
                                        } else {
                                            oil[attr][key][o][v] = (oil[attr][key][o][v] - 273.15).toFixed(3);
                                            k2 = k.substring(0, k.length - 2) + '_f';
                                            oil[attr][key][o][k2] = this.cToF(oil[attr][key][o][v]).toString();
                                            oil[attr][key][o][v] = '(' + oil[attr][key][o][v] + ')';
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
    					for (var s = 0; s < oil[attr].length; s++){
    						for (var v in oil[attr][s]) {
    							if (!oil[attr][s][v] && oil[attr][s] !== 'weathering'){
    								oil[attr][s][v] = "--";
    							} else if (v === 'ref_temp_k' || v === 'vapor_temp_k' || v === 'liquid_temp_k') {
                                    var v2;
                                    if (oil.estimated[attr]){
                                        oil[attr][s][v] = (oil[attr][s][v] - 273.15).toFixed(2);
                                        v2 = v.substring(0, v.length - 2) + '_f';
                                        oil[attr][s][v2] = '<code>' + this.cToF(oil[attr][s][v]).toString() + '</code>';
                                        oil[attr][s][v] = '<code>(' + oil[attr][s][v] + ')</code>';
                                    } else {
                                        oil[attr][s][v] = (oil[attr][s][v] - 273.15).toFixed(3);
                                        v2 = v.substring(0, v.length - 2) + '_f';
                                        oil[attr][s][v2] = this.cToF(oil[attr][s][v]).toString();
                                        oil[attr][s][v] = '(' + oil[attr][s][v] + ')';
                                    }
                                } else if (v === 'kg_m_3'){
                                    if (oil.estimated[attr]){
                                        oil[attr][s][v] = '<code>' + (oil[attr][s][v] / 1000).toFixed(3) + '</code>';
                                    } else {
                                        oil[attr][s][v] = (oil[attr][s][v] / 1000).toFixed(3);
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
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + (oil[attr] * 1000).toFixed(3) + '</code>';
                    } else {
                        oil[attr] = (oil[attr] * 1000).toFixed(3);
                    }
                } else if (attr === 'api'){
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + oil[attr].toFixed(3) + '</code>';
                    } else {
                        oil[attr] = oil[attr].toFixed(3);
                    }
                } else if (attr === 'adhesion_kg_m_2'){
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + oil[attr] + '</code>';
                    }
                }
			}
			return oil;
		}

	});
	return specificOil;
});