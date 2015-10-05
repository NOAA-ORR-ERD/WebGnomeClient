define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'views/form/location',
    'text!templates/form/map/mapSelect.html'
], function($, _, Backbone, FormModal, LocationForm, SelectTemplate){
    'use strict';
    var mapTypeForm = FormModal.extend({
        title: 'Select Map Type',
        className: 'modal fade form-modal shorelinetype-form',

        events: function(){
            return _.defaults({
                'click .waterWorld': 'waterWorld',
                'click .parameterized': 'parameterized',
                'click .realLocation': 'realLocation'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model){
            this.model = model;
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(SelectTemplate);
            this.buttons = null;
            FormModal.prototype.render.call(this, options);
        },

        waterWorld: function(e){
            webgnome.model.resetLocation(_.bind(function(){
                webgnome.router.views[1].updateLocation();
                webgnome.router.views[1].updateCurrent();
                webgnome.router.views[1].mason.layout();
                webgnome.router.views[1].updateMap();
                this.hide();
            }, this));
        },

        parameterized: function(e){
            
        },

        realLocation: function(e){
            this.on('hidden', function(){
                var locationForm = new LocationForm();
                locationForm.render();
                locationForm.on('loaded', function(){
                    webgnome.router.views[1].updateLocation();
                    webgnome.router.views[1].updateCurrent();
                    webgnome.router.views[1].mason.layout();
                    webgnome.router.views[1].updateMap();
                });
            });
        }

    });
    return mapTypeForm;
});