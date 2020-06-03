define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/map/map.html'
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
            
            var nswe = this.model.getBoundingRectangle_nswe();
            
            this.body = _.template(MapTemplate, {
                model: this.model,
                nswe: nswe,

            });
            FormModal.prototype.render.call(this, options);
        },

        update: function() {
            var name = this.$('#name').val();
            
            var north = this.$('#north').val();
            var south = this.$('#south').val();
            var west = this.$('#west').val();
            var east = this.$('#east').val();
            var map_bounds = this.model.setBoundingRectangle_nswe(north,south,west,east);
            
            this.model.set('name', name);
            this.model.set('map_bounds', map_bounds);
            
            if (this.model.get('obj_type') !== "gnome.map.GnomeMap") {
                var refloat = this.$('#refloat_halflife').val();
                var raster_size = this.$('#raster_size').val() * 1024 * 1024;
                this.model.set('raster_size', raster_size);
                this.model.set('refloat_halflife', refloat);
                
            }
        }
	});
	
	return mapForm;
});