define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'model/map/bna',
    'views/modal/form',
    'text!templates/form/map/map.html'
], function(_, $, Backbone, module, MapBNAModel, FormModal, MapTemplate){
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

            this.model.set('north', nswe[0]);
            this.model.set('south', nswe[1]);
            this.model.set('west', nswe[2]);
            this.model.set('east', nswe[3]);
            
            var shift360 = false;
            if ((nswe[3] < 0 && nswe[2] < 0) && (this.model.get('obj_type') === 'gnome.maps.map.MapFromBNA')) {
                shift360 = true;
            }
                      
            this.body = _.template(MapTemplate, {
                model: this.model,
                nswe: nswe,
                shift360: shift360,
            });
            FormModal.prototype.render.call(this, options);
            

        },

        update: function() {
            
            var shiftLons = this.$('#shift_lons:checked').val();
            if (shiftLons) {
                
                var oldmap = webgnome.model.get('map');
                           
                var map = new MapBNAModel({approximate_raster_interval: oldmap.get('aproximate_raster_interval'), name: oldmap.get('name'), map_bounds: oldmap.get('map_bounds'), filename: oldmap.get('filename'), raster_size: oldmap.get('raster_size'), refloat_halflife: oldmap.get('refloat_halflife'), shift_lons: 360});                
                webgnome.model.save('map', map, {'validate':true});                
                
            }
            
            var name = this.$('#name').val();

            var north = parseFloat(this.$('#north').val());
            var south = parseFloat(this.$('#south').val());
            var west = parseFloat(this.$('#west').val());
            var east = parseFloat(this.$('#east').val());
            var map_bounds = this.model.setBoundingRectangle_nswe(north,south,west,east);

            this.model.set('north', north);
            this.model.set('south', south);
            this.model.set('west', west);
            this.model.set('east', east);

            this.model.set('name', name);
            this.model.set('map_bounds', map_bounds);

            if (this.model.get('obj_type') !== "gnome.maps.map.GnomeMap") {
                var refloat = this.$('#refloat_halflife').val();
                var raster_size = this.$('#raster_size').val() * 1024 * 1024;
                this.model.set('raster_size', raster_size);
                this.model.set('refloat_halflife', refloat);

            }
        }
	});

	return mapForm;
});