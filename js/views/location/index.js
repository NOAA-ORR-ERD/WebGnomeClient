define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'cesium',
    'views/cesium/cesium',
    'model/location',
    'model/gnome',
    'sweetalert',
    'text!templates/location/index.html',
    'text!templates/location/list.html',
    'views/wizard/location',
    'views/default/help',
    'views/modal/help'
], function($, _, Backbone, BaseView, module, Cesium, CesiumView, GnomeLocation, GnomeModel, swal, LocationsTemplate, ListTemplate, LocationWizard, HelpView, HelpModal){
    'use strict';
    var locationsView = BaseView.extend({
        className: 'page locations',
        mapView: null,
        popup: null,

        events: function(){
            return _.defaults({
                'click .item': 'highlightLoc',
                'click .item a': 'setupLocation',
                'click .doc': 'doc'
            }, BaseView.prototype.events);
        },

        /**
         * @todo decomp the popover into a new view? How else to get load click event?
         */
        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            if (!_.isUndefined(options) && _.has(options, 'dom_target')) {
                this.dom_target = options.dom_target;
            } else {
                this.dom_target = 'body';
            }
            if(!webgnome.hasModel()){
                if(_.has(webgnome, 'cache')){
                    webgnome.cache.rewind();
                }
                webgnome.model = new GnomeModel();
                $('body').append(this.$el);
                webgnome.model.save(null, {
                    validate: false,
                    success: _.bind(function(){
                        this.render();
                        $.ajax(webgnome.config.api + '/location').success(_.bind(this.ajax_render, this)).error(function(){
                            console.log('Error retrieving location files.');
                        });
                    }, this)
                });
            } else {
                this.render();
                $.ajax(webgnome.config.api + '/location').success(_.bind(this.ajax_render, this)).error(function(){
                    console.log('Error retrieving location files.');
                });
            }
        },

        showHelp: function(){
            var compiled = '<div class="gnome-help" title="Get Help on Location Files"></div>';
            this.$('h2:first').append(compiled);
            this.$('h2:first .gnome-help').tooltip();
        },
        
        loadHelp: function(e, options) {
            var name, helpView, helpModal;
            if (!_.isNull(e)){
                e.stopPropagation();
                name = $(e.target).data('name');
            } else {
                name = options.name;
            }

            name = 'views/model/locations/' + name.split(",")[0].replace(/\s/g, "_");

            helpView = new HelpView({path: name, context: 'view'});
            helpModal = new HelpModal({help: helpView});

            helpModal.on('hidden', function(){
                helpModal.close();
            });

            this.$('.popup').popover('destroy');
            helpModal.render();
        },

        doc: function(e){
            e.preventDefault();
            window.open("doc/location_files.html");
        },

        setupLocation: function(e, options){
            var slug, name;
            if (!_.isNull(e)){
                e.stopPropagation();
                slug = $(e.target).data('slug');
                name = $(e.target).data('name');
            } else {
                slug = options.slug;
                name = options.name;
            }
            webgnome.model = new GnomeModel();
            if(_.has(webgnome, 'cache')){
                webgnome.cache.rewind();
            }
            webgnome.model.save(null, {
                validate: false,
                success: _.bind(function(){
                    this.wizard({slug: slug, name: name});
                    this.$('.popup').popover('destroy');
                }, this)
            });
        },

        load: function(options){
            this.loading = true;
            this.trigger('load');
            var locationModel = new GnomeLocation({id: options.slug});
            locationModel.fetch({
                success: _.bind(function(){
                    webgnome.model.fetch({
                        success: _.bind(function(){
                            this.trigger('loaded');
                            this.loading = false;
                            webgnome.router.navigate('config', true);
                        }, this)
                    });
                }, this)
            });
        },

        render: function(){
            BaseView.prototype.render.call(this);
            var compiled = _.template(LocationsTemplate);
            this.$el.html(_.template(LocationsTemplate));
            this.$el.appendTo(this.dom_target);
            this.mapView = new CesiumView();
            this.$('#locations-map').append(this.mapView.$el);
            this.mapView.render();
        },

        ajax_render: function(geojson){
            this.locations = [];
            for (var i = 0; i < geojson.features.length; i++) {
                var feature = geojson.features[i];
                var content = '<button class="btn btn-primary help" data-name="' + feature.properties.title + '">About</button><button class="btn btn-primary setup" data-slug="' + feature.properties.slug + '" data-name="' + feature.properties.title + '">Load Location</button>';
                this.locations.push(this.mapView.viewer.entities.add({
                    name: feature.properties.title,
                    id: feature.properties.slug,
                    description: content,
                    position: new Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0], feature.geometry.coordinates[1]),
                    billboard: {
                        image: '/img/spill-pin.png',
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER
                    },
                    show: true,
                    feature: feature,
                }));
            }
            var sortedLocations = geojson.features.sort(function(a, b) {
                var textA = a.properties.title.toUpperCase();
                var textB = b.properties.title.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            var list = _.template(ListTemplate, {
                locations: sortedLocations
            });
            this.$('.location-list').append(list);
            this.addCesiumHandlers();

        },

        highlightLoc: function(e){
            var loc = e.currentTarget;
            var coords = $(loc).data('coords').split(',');
            coords = [parseFloat(coords[0]), parseFloat(coords[1])];
            var slug = $('.btn',e.currentTarget)[0].getAttribute('data-slug');
            var entity = this.mapView.viewer.entities.getById(slug);
            this.mapView.viewer.flyTo(entity, {duration: 0.1, offset: new Cesium.HeadingPitchRange(0, 0, 150000)});
            setTimeout(_.bind(function(){
                this.triggerPopover({id: entity});
            }, this), 200);
        },

        triggerPopover: function(pickedObject) {
            if (pickedObject) {
                if (!_.isUndefined(pickedObject.id) && pickedObject.id instanceof Cesium.Entity) {
                    var feature = pickedObject.id.feature;
                    var coords = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.mapView.viewer.scene, new Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0], feature.geometry.coordinates[1]));
                    this.$('.popup').off('shown.bs.popover');
                    this.$('.popup').css("top", coords.y + "px");
                    this.$('.popup').css("left", coords.x + 15 + "px"); //15 to offset the col-md-12 padding
                    var content = '<button class="btn btn-primary help" data-name="' + feature.properties.title + '">About</button><button class="btn btn-primary setup" data-slug="' + feature.properties.slug + '" data-name="' + feature.properties.title + '">Load Location</button>';
                    if (this.$('.popover').length > 0) {
                        this.$('.popup').popover('show'); //relocates the popover, but also resets the content
                        this.$('.popover-title').html(feature.properties.title); // set new content
                        this.$('.popover-content').html(content); // set new content
                    } else {
                        this.$('.popup').popover({
                            placement: 'top',
                            html: true,
                            title: feature.properties.title,
                            content: $(content)
                        });
                        this.$('.popup').popover('show');
                    }
                    this.$('.popup').one('shown.bs.popover', _.bind(function(){
                        this.$('.load').on('click', _.bind(function(){
                            var slug = this.$('.load').data('slug');
                            var name = this.$('.load').data('name');
                            webgnome.model.resetLocation(_.bind(function(){
                                this.load({slug: slug, name: name});
                                this.$('.popup').popover('destroy');
                            }, this));
                        }, this));

                        this.$('.setup').on('click', _.bind(this.setupLocation, this));

                        this.$('.help').on('click', _.bind(this.loadHelp, this));
                    }, this));
                }
                this.lockCamera();
            } else {
                this.$('.popover').hide();
                this.unlockCamera();
            }
        },

        unlockCamera: function() {
            this.mapView.viewer.scene.screenSpaceCameraController.enableRotate = true;
            this.mapView.viewer.scene.screenSpaceCameraController.enableTranslate = true;
            this.mapView.viewer.scene.screenSpaceCameraController.enableZoom = true;
            this.mapView.viewer.scene.screenSpaceCameraController.enableTilt = true;
            this.mapView.viewer.scene.screenSpaceCameraController.enableLook = true;
        },

        lockCamera: function() {
            this.mapView.viewer.scene.screenSpaceCameraController.enableRotate = false;
            this.mapView.viewer.scene.screenSpaceCameraController.enableTranslate = false;
            this.mapView.viewer.scene.screenSpaceCameraController.enableZoom = false;
            this.mapView.viewer.scene.screenSpaceCameraController.enableTilt = false;
            this.mapView.viewer.scene.screenSpaceCameraController.enableLook = false;
        },

        dblClickPin: function(entity) {
            var slug = entity.id;
            var name = entity.name;
            if (this.$('.popover').length > 0) {
                this.$('.popover').hide();
                this.unlockCamera();
            }
            this.setupLocation(null, {slug: slug, name: name});
        },

        wizard: function(options){
            this.trigger('load');
            this.wizard_ = new LocationWizard(options);
        },

        addCesiumHandlers: function() {

            //disable default cesium focus-on-doubleclick
            this.mapView.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            //single click on pin toggles popover
            this.singleClickHandler = new Cesium.ScreenSpaceEventHandler(this.mapView.viewer.scene.canvas);
            var singleClickHandlerFunction = _.bind(function(movement){
                var pickedObject = this.mapView.viewer.scene.pick(movement.position);
                this.triggerPopover(pickedObject);
                this.trigger('requestRender');
                setTimeout(_.bind(this.trigger, this), 50, 'requestRender');
            }, this);
            this.singleClickHandler.setInputAction(singleClickHandlerFunction, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            //double click goes straight to opening the wizard
            this.doubleClickHandler = new Cesium.ScreenSpaceEventHandler(this.mapView.viewer.scene.canvas);
            var doubleClickHandlerFunction = _.bind(function(movement){
                var pickedObject = this.mapView.viewer.scene.pick(movement.position);
                this.mapView.viewer.flyTo(pickedObject.id, {duration: 0.1, offset: new Cesium.HeadingPitchRange(0, 0, 150000)});
                this.dblClickPin(pickedObject.id);
                this.trigger('requestRender');
                setTimeout(_.bind(this.trigger, this), 50, 'requestRender');
            }, this);
            this.doubleClickHandler.setInputAction(doubleClickHandlerFunction, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }

    });

    return locationsView;
});
