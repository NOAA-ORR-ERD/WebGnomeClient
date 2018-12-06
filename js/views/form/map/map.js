define([
    'underscore',
    'jquery',
    'backbone',
    'ol',
    'views/modal/form',
    'text!templates/form/map.html'
], function(_, $, Backbone, ol, FormModal, MapTemplate){
    'use strict';
    var mapForm = FormModal.extend({
        className: 'modal form-modal map-form',
        name: 'map',
        title: 'Map',

		events: function() {
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options){
            this.model = options.map;
            FormModal.prototype.initialize.call(this, options);
        },
        
        render: function(options) {
            this.body = _.template(MapTemplate, {
                name: this.model.get('name'),
                refloat: this.model.get('refloat_halflife'),

            });
            FormModal.prototype.render.call(this, options);
        },

        update: function() {
            var name = this.$('#name').val();
            var refloat = this.$('#refloat').val();

            this.model.set('name', name);
            this.model.set('refloat_halflife', refloat);
        }
	});
	
	return mapForm;
});