define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/map.html'
], function(_, $, Backbone, module, FormModal, MapTemplate){
    'use strict';
    var mapForm = FormModal.extend({
        className: 'modal form-modal map-form',
        name: 'map',
        title: 'Map',

		events: function() {
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            this.model = options.map;
            FormModal.prototype.initialize.call(this, options);
        },
        
        render: function(options) {
            this.body = _.template(MapTemplate, {
                name: this.model.get('name'),
                refloat: this.model.get('refloat_halflife'),
                //map_bounds: this.model.get('map_bounds'),

            });
            FormModal.prototype.render.call(this, options);
        },

        update: function() {
            var name = this.$('#name').val();
            var refloat = this.$('#refloat').val();
            //var map_bounds = this.$('#map_bounds').val();
            
            this.model.set('name', name);
            this.model.set('refloat_halflife', refloat);
            //this.model.set('map_bounds', map_bounds);
        }
	});
	
	return mapForm;
});