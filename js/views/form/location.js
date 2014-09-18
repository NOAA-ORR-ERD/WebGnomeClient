define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'views/location/index',
    'views/modal/loading',
    'model/location',
    'model/gnome'
], function($, _, Backbone, FormModal, LocationView, LoadingModal, GnomeLocation, GnomeModel){
    var locationModal = FormModal.extend({
        className: 'modal fade form-modal location-form',
        size: 'lg',
        title: 'Select a Location',

        events: function(){
            return _.defaults({
                'show.bs.modal': 'renderSubview',
                'shown.bs.modal': 'updateMapSize'
            }, FormModal.prototype.events);
        },

        render: function(){
            this.buttons = null;
            FormModal.prototype.render.call(this);
        },

        renderSubview: function(){
            this.locationView = new LocationView({
                dom_target: '.location-form .modal-body',
                className: 'page locations'
            });
            this.locationView.load = function(options){
                this.trigger('load');
                webgnome.model.resetLocation();
                var locationModel = new GnomeLocation({id: options.slug});
                locationModel.fetch({
                    success: _.bind(function(){
                        var newModel = new GnomeModel();
                        newModel.fetch({
                            success: _.bind(function(){
                                webgnome.model.mergeModel(newModel);
                                webgnome.model.set('id', newModel.get('id'));
                                webgnome.model.save(null, {
                                    success: _.bind(function(){
                                        this.trigger('done');
                                    }, this)
                                });
                            }, this)
                        });
                    }, this)
                });
            };
            this.locationView.on('load', this.handoff, this);
        },

        handoff: function(){
            this.hide();
            this.loadingModal = new LoadingModal();
            this.loadingModal.render();
            this.locationView.on('done', this.hide, this.loadingModal);
        },

        updateMapSize: function(){
            this.locationView.mapView.map.updateSize();
        },

        close: function(){
            this.locationView.close();
            FormModal.prototype.close.call(this);
        }

    });

    return locationModal;
});