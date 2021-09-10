define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'module',
    'd3',
    'views/modal/form',
    'text!templates/form/spill/map.html',
    'text!templates/form/spill/map/controls.html',
    'views/cesium/cesium'
], function($, _, Backbone, Cesium, module, d3, FormModal, MapViewTemplate, MapControlsTemplate, CesiumView) {
    'use strict';
    var mapSpillView = FormModal.extend({

        title: 'Spill Location',
        className: 'modal form-modal map-modal-form',
        size: 'lg',

        events: function() {
            return _.defaults({
                'click .spill-button .fixed': 'enablePointMode',
                'click .spill-button .moving': 'enableLineMode',
                'click input': 'switchCoordFormat',
            }, FormModal.prototype.events);
        },

        initialize: function(options, release) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);

            if (!_.isUndefined(options.model)) {
                this.model = options.model;
            } else {
                this.model = release;
            }

            this.placeMode = 'point';
            this.heldPin = null;
            this.invalidPinLocation = false;
            this.origModel = this.model;
            this.mouseTool = null;
        },

        render: function(options) {
            var cid = this.model.cid;
            this.body = _.template(MapViewTemplate)({
                cid: cid
            });
            FormModal.prototype.render.call(this, options);
            this.mapView = new CesiumView();
            this.$('#spill-form-map-' + this.model.cid).append(this.mapView.$el);
            this.mapView.render();
            this.mouseTool = this.mapView.toolbox.defaultTool;
            if (this.mouseTool.toolName !== 'baseMapTool') {
                console.error('incorrect mouse tool enabled. this form will not work!');
            }
            this.addMapControls();

            //add map polygons
            var map = webgnome.model.get('map');
            map.getGeoJSON().then(_.bind(function(data){
                map.processMap(data, null, this.mapView.viewer.scene.primitives);
            }, this));
            //add Map Bounds
            var bnds = map.genBnd(this.mapView.viewer);
            bnds.show = true;
            //add Spillable area
            var sa = map.genSA(this.mapView.viewer);
            sa.show = true;
            
            this.mapView.resetCamera(map);

            //add release visualization, and allowing it to be movable
            var ds = this.model.generateVis({movable: true});
            this.mapView.viewer.dataSources.add(ds);
            this._spillPins = ds.entities.spillPins;
            this._spillLineSegments = ds.entities.spillLineSegments;

            //listen to CesiumView to handle entity movement events.
            this.listenTo(this.mapView, 'pickupEnt', _.bind(this.pickupPinHandler, this));
            this.listenTo(this.mapView, 'droppedEnt', _.bind(this.droppedPinHandler, this));
            this.listenTo(this.mapView, 'resetEntPickup', _.bind(this.resetPinPickupHandler, this));

            var positions = [this.model.get('start_position'), this.model.get('end_position')]; //future: this.model.get('positions')
            var samePositions = _.every(positions, function(pos) {return _.isEqual(pos, positions[0]);});
            if (!samePositions) {
                this.enableLineMode();
                _.each(this._spillPins, function(sp){sp.show = true;});
                if (_.isEqual(positions[0], [0,0,0])) {
                    this.mouseTool.pickupEnt(null, this._spillPins[0]);
                }
            } else {
                this.enablePointMode();
            }

            //this.renderSpillFeature();
            //this.toggleSpill();
        },

        pickupPinHandler: function (ent) {
            if (this.placeMode === 'point' && !this.$('.fixed').hasClass('on')) {
                this.$('.fixed').addClass('on');
                this.$('.fixed').tooltip('show');
            } else if (this.placeMode === 'line' && !this.$('.moving').hasClass('on')){
                this.$('.moving').addClass('on');
                this.$('.moving').tooltip('show');
            }
        },

        droppedPinHandler: function(ent, coords) {
            //this context should always be the Form object
            var prev = this.model.get(ent.model_attr);
            var map = webgnome.model.get('map');
            var nswe = map.getBoundingRectangle_nswe();            
            if (nswe[3] > 180 && coords[0]<0) {
                coords[0] = coords[0] + 360;
            }            
            var SATest = this.model.testVsSpillableArea(coords, map);
            var MBTest = this.model.testVsMapBounds(coords, map);
            if (!MBTest) {
                //spill outside map bounds
                this.error('Start or end position outside map bounds. Some or all particles may disapear immediately on release');
                this.model.set(ent.model_attr, coords);
            } else {
                if (SATest) {
                    //all is good
                    this.model.set(ent.model_attr, coords);
                    this.clearError();
                    return;
                } else {
                    var spill_on_land = false; // stub for future if we do spill land detection in client
                    if (spill_on_land) {
                        this.error('Placement error! Start or End position are on land');
                        this.invalidPinLocation = true;
                    } else {
                        this.model.set(ent.model_attr, coords);
                        this.error('Start or end position outside supported area. Some or all particles may disappear immediately on release');
                    }
                }
            } 
        },

        resetPinPickupHandler: function(ent) {
            //this context should always be the Form object
            var btn_name;
            if (ent) {
                if (this.invalidPinLocation) {
                    //pickup entity again
                    this.invalidPinLocation = false;
                    this.mouseTool.pickupEnt(null, ent);
                    return;
                }
                if (this.placeMode === 'point') {
                    btn_name = '.fixed';
                    this.model.set('end_position', this.model.get('start_position'));
                    _.each(this._spillPins, _.bind(function(sp) {sp.position.setValue(this._spillPins[0].position.getValue(Cesium.Iso8601.MINIMUM_VALUE));}, this));
                } else {
                    btn_name = '.moving';
                    var nextIdx = ent.index+1;
                    ent.label.show = false;
                    if (nextIdx < this._spillPins.length) {
                        this._spillPins[nextIdx].label.show = true;
                        this.mouseTool.pickupEnt(null, this._spillPins[nextIdx]);
                        return;
                    }
                }
            }
        },

        enablePointMode: function(e) {
            if (!_.isNull(this.mouseTool.heldEnt)) {
                this.mouseTool.cancelEnt(null, this.mouseTool.heldEnt);
            }
            this.placeMode = 'point';
            this.$('.moving').removeClass('on');
            this.$('.moving').tooltip('hide');
            var bt = this.$('.fixed');
            _.each(this._spillPins, function(sp){sp.show = false;});
            this._spillPins[0].show = true;
            this.mouseTool.pickupEnt(null, this._spillPins[0]);
    },

        enableLineMode: function(e) {
            if (!_.isNull(this.mouseTool.heldEnt) && !_.isEqual(this.model.get('start_position'), [0,0,0])) {
                this.mouseTool.cancelEnt(null, this.mouseTool.heldEnt);
            }
            this.placeMode = 'line';
            this.$('.fixed').removeClass('on');
            this.$('.fixed').tooltip('hide');
            var bt = this.$('.moving');
            this.$('.moving').addClass('on');
            this.$('.moving').tooltip('show');
            this.mapView.viewer.scene.requestRender();
        },

        switchCoordFormat: function(e) {
            _.each(this._spillPins, function(p){p.coordFormat = e.currentTarget.getAttribute('value');});
        },

        addMapControls: function(){
            var controls = _.template(MapControlsTemplate)({});
            this.$('.cesium-viewer').append(controls);
            this.$('[data-toggle="tooltip"]').tooltip({placement: 'right', trigger: 'hover click'});
        },

        save: function() {
            this.clearError();
            this.trigger('save');
            this.hide();
            // var err = this.model.validateLocation();
            // if (err) {
            //     this.error("Placement error!", err);
            // } else {
            // }
        },

        wizardclose: function() {
            this.model = this.origModel;
            this.trigger('wizardclose');
        },

        close: function(){
            if (!_.isUndefined(this.spillMapView)){
                this.spillMapView.close();
            }
            
            FormModal.prototype.close.call(this);
        }
    });

    return mapSpillView;
});
