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

        events: {
            'shown.bs.tab': 'tabRender'
        },

		initialize: function(options){
            if (!_.isUndefined(options.containerClass)) {
                this.containerClass = options.containerClass;
                this.viewName = 'oilInfo';
            } else {
                this.viewName = 'oilLib';
            }
            if (!_.isUndefined(options.infoMode)) {
                options.model.fetch({
                    success: _.bind(function(model){
                        this.model = model;
                        this.render(options);
                    }, this)
                });
            } else {
                this.render(options);
            }
		},

		render: function(options){
			var data = this.dataParse(this.model.attributes);
            var viewName = this.viewName;
			var compiled = _.template(SpecificOilTemplate, {data: data, viewName: viewName});
            if (!_.isUndefined(this.containerClass)) {
                var containerClass = this.containerClass;
                $(containerClass + ' .modal-body').append(this.$el.html(compiled));
            } else {
                $('.oil-form .modal-body').append(this.$el.html(compiled));
            }
		},

        tabRender: function(){
            this.$('.info:visible').tooltip({
                container: '.modal'
            });
        },

        cToF: function(c){
            return (((c * (9/5)) + 32).toFixed(1));
        },

        groupAnalysis: [
            'aromatics_fraction',
             'polars_fraction',
             'resins_fraction',
             'saturates_fraction',
             'paraffins_fraction',
             'sulphur_fraction',
             'benzene_fraction',
             'wax_content_fraction',
             'asphaltenes_fraction'
            ],

        tempAttrs: [
             'pour_point_min_k',
             'pour_point_max_k',
             'flash_point_max_k',
             'flash_point_min_k'
            ],

        estimatedParse: function(){
            
        },

		dataParse: function(oilParam){
            var oil = $.extend(true, {}, oilParam);
            for (var attr in oil){
                // When value of oil attribute is null
                if (!oil[attr] && this.tempAttrs.indexOf(attr) === -1 && attr.indexOf('emuls') === -1){
                    oil[attr] = "--";
                } else if (attr === 'bullwinkle_fraction'){
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + oil[attr].toFixed(2) + '</code>';
                    } else {
                        oil[attr] = oil[attr].toFixed(2);
                    }
                }
                // Checks if oil attribute is one of the interfacial tensions and if so converts to cSt
                else if (attr === 'oil_seawater_interfacial_tension_n_m' || attr === 'oil_water_interfacial_tension_n_m') {
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + (oil[attr] * 1000).toFixed(1) + '</code>';
                    } else {
                        oil[attr] = (oil[attr] * 1000).toFixed(1);
                    }
                } else if (attr === 'api'){
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + oil[attr].toFixed(1) + '</code>';
                    } else {
                        oil[attr] = oil[attr].toFixed(1);
                    }
                } else if (attr === 'adhesion_kg_m_2'){
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + oil[attr] + '</code>';
                    }
                }
                this.parseTemperatureData(oil, attr);
                this.parseGroupAnalysis(oil, attr);
                // When value of oil attribute is of type object but not array
                this.parseObjectData(oil, attr);
                // When value of oil attribute is of type array
                this.parseArrayData(oil, attr);
			}
			return oil;
		},

        parseTemperatureData: function(oil, attr){
            if (this.tempAttrs.indexOf(attr) !== -1){
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
                    var celsius = (oil[attr] - 273.15).toFixed(1);
                    if (oil.estimated[attr]){
                        oil[attr] = '<code>' + this.cToF(celsius) + ' (' + celsius + ')</code> &deg;F (&deg;C)';
                    } else {
                        oil[attr] = this.cToF(celsius) + ' (' + celsius + ') &deg;F (&deg;C)';
                    }
                } else {
                    for (var i = 0; i < this.tempAttrs.length; i++){
                        if (attr === this.tempAttrs[i]){
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
            }
        },

        parseGroupAnalysis: function(oil, attr){
            // Checks if oil attribute is one of the group analysis terms and if so converts to percent
            if (this.groupAnalysis.indexOf(attr) !== -1 && !_.isNull(oil[attr])){
                oil[attr] = isNaN(Math.round((oil[attr] * 100).toFixed(2))) ? '--' : Math.round((oil[attr] * 100).toFixed(2));
            }
        },

        parseObjectData: function(oil, attr){
            if (_.isObject(oil[attr]) && !_.isArray(oil[attr])){
                for (var key in oil[attr]){
                    if (_.isArray(oil[attr][key]) && oil[attr][key].length === 0){
                        if (key === 'kvis' || key === 'synonyms'){
                            oil[attr][key] = false;
                        }
                    } else if (_.isArray(oil[attr][key])) {
                    // For loop that goes through array
                        var p;
                        for (var o = 0; o < oil[attr][key].length; o++){
                            for (var k in oil[attr][key][o]) {
                                if (!oil[attr][key][o][p] && oil[attr][key][o] !== 'weathering'){
                                    oil[attr][key][o][p] = "--";
                                } else if (k === 'ref_temp_k' || k === 'vapor_temp_k' || k === 'liquid_temp_k') {
                                    var k2;
                                    if (oil.estimated[attr]){
                                        oil[attr][key][o][p] = (oil[attr][key][o][p] - 273.15).toFixed(1);
                                        k2 = k.substring(0, k.length - 2) + '_f';
                                        oil[attr][key][o][k2] = '<code>' + this.cToF(oil[attr][key][o][p]).toString() + '</code>';
                                        oil[attr][key][o][p] = '<code>(' + oil[attr][key][o][p] + ')</code>';
                                    } else {
                                        oil[attr][key][o][p] = (oil[attr][key][o][p] - 273.15).toFixed(1);
                                        k2 = k.substring(0, k.length - 2) + '_f';
                                        oil[attr][key][o][k2] = this.cToF(oil[attr][key][o][p]).toString();
                                        oil[attr][key][o][p] = '(' + oil[attr][key][o][p] + ')';
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        parseArrayData: function(oil, attr){
            // When oil attribute is an empty array
            if (_.isArray(oil[attr])) {
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
                                    oil[attr][s][v] = (oil[attr][s][v] - 273.15).toFixed(1);
                                    v2 = v.substring(0, v.length - 2) + '_f';
                                    oil[attr][s][v2] = '<code>' + this.cToF(oil[attr][s][v]).toString() + '</code>';
                                    oil[attr][s][v] = '<code>(' + oil[attr][s][v] + ')</code>';
                                } else {
                                    oil[attr][s][v] = (oil[attr][s][v] - 273.15).toFixed(1);
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
        }
	});
	return specificOil;
});