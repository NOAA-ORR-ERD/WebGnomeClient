define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'text!templates/model/layers.html',
    'moment',
    'views/form/inspect',
    'views/model/layer',
    'model/appearance',
], function ($, _, Backbone, BaseView, module, LayersTemplate, moment, InspectForm, LayerModel, Appearance) {
    "use strict";
    var layersView = BaseView.extend({
        events: {
            'change .imagery_layers input': 'toggleImageryLayers',
            'change .map_layers input': 'toggleMapLayers',
            'change .spills input': 'toggleSpillLayers',
            'click .env-grid input': 'toggleEnvGrid',
            'click .env-uv input': 'toggleEnvUV',
            'click .env-edit-btn': 'openInspectModal',
            'click .current-grid input': 'toggleGrid',
            'click .current-uv input': 'toggleUV',
            'click .ice-uv input': 'toggleUV',
            //'click .ice-grid input[type="radio"]': 'toggleGrid',
            //'click .ice-tc input[type="checkbox"]': 'toggleIceTC',
            //'click .ice-tc input[type="radio"]': 'toggleIceData',
            'click .layers .title': 'toggleLayerPanel'
        },
        id: 'layers',

        initialize: function(viewer, options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            this.$el.appendTo('map');
            if(webgnome.hasModel() && this.modelMode !== 'adios'){
                this.modelListeners();
            }
            this.layers = new Backbone.Collection(null,{model: LayerModel});
            this.viewer = viewer // Cesium viewer associated with this panel
        },

        modelListeners: function(){
            this.listenTo(webgnome.model.get('movers'), 'add remove', this.render);
            this.listenTo(webgnome.model.get('environment'), 'add remove', this.render);
            this.listenTo(webgnome.model.get('spills'), 'add remove change', this.render);
            this.listenTo(webgnome.model, 'change:map', this.addMapListener);
            this.listenTo(webgnome.model, 'change:map', this.resetMap);
        },

        addMapListener: function(){
            //this.listenTo(webgnome.model.get('map'), 'change', this.resetMap);
        },

        resetMap: function(e){
            if (this._map_layer && e && e.changed.map.id !== e.previousAttributes().map.id) {
                let oldMap = e.previousAttributes().map
                this.layers.remove(this.layers.findWhere({id: oldMap.id}));
                this.layers.remove(this.layers.findWhere({id: oldMap.id + '_sa'}));
                this.layers.remove(this.layers.findWhere({id: oldMap.id + '_bounds'}));
            }
            let map = webgnome.model.get('map');
            this.layers.add(
                [{
                    type: 'cesium',
                    parentEl: 'dataSource',
                    model: map,
                    id: map.id,
                    visObj: map._mapVis,
                    appearance: map.get('_appearance').findWhere({'id': 'map'})
                },
                {
                    type: 'cesium',
                    parentEl: 'dataSource',
                    model: map,
                    id: map.id + '_sa',
                    visObj: map._spillableVis,
                    appearance: map.get('_appearance').findWhere({'id': 'sa'})
                },
                {
                    type: 'cesium',
                    parentEl: 'entity',
                    model: map,
                    id: map.id + '_bounds',
                    visObj: map._boundsVis,
                    appearance: map.get('_appearance').findWhere({'id': 'bounds'})
                }]
            );
            this._map_layer = this.layers.findWhere({id: map.id});
            this._sa_layer = this.layers.findWhere({id: map.id + '_sa'});
            this._bounds_layer = this.layers.findWhere({id: map.id + '_bounds'});
            if (e) {
                if(webgnome.router.trajView) {
                    webgnome.router.trajView._flyTo = true;
                }
            }
        },

        setupLayersTooltips: function() {
            this.$('.env-grid-hdr').tooltip(this.createTooltipObject("Show Grid"));
            this.$('.env-uv-hdr').tooltip(this.createTooltipObject("Show Data"));
            this.$('.env-edit-hdr').tooltip(this.createTooltipObject("Inspect"));
            //this.$('.env-edit-btn').tooltip(this.createTooltipObject("Edit"));
        },

        createTooltipObject: function(title) {
            return {
                "title": title,
                "container": "body",
                "placement": "bottom"
            };
        },

        toggleLayerPanel: function(){
            this.$('.layers').toggleClass('expanded');
        },

        render: function(){
            // only compile the template if the map isn't drawn yet
            // or if there is a redraw request because of the map object changing

            // Create map layers
            this.resetMap();
            if(webgnome.router.trajView) {
                webgnome.router.trajView._flyTo = true;
            }

            // Create spill layers 
            var model_spills = webgnome.model.get('spills');
            this._spill_layers=[];
            for (let i = 0; i < model_spills.length; i++) {
                let spillLayer = new LayerModel({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: model_spills.models[i],
                    id: model_spills.models[i].id,
                    visObj: model_spills.models[i].les,
                    appearance: model_spills.models[i].get('_appearance').findWhere({id:'les'})
                });
                let spillLocLayer = new LayerModel({
                    type: 'cesium',
                    parentEl: 'entity',
                    model: model_spills.models[i],
                    id: model_spills.models[i].id + '_loc',
                    visObj: model_spills.models[i]._locVis,
                    appearance: model_spills.models[i].get('_appearance').findWhere({id:'loc'})
                });
                this.layers.add([ spillLayer, spillLocLayer]);
            }

            // Create environment object layers
            var env_objs = webgnome.model.get('environment').filter(function(obj) {
                var ot = obj.get('obj_type').split('.');
                ot.pop();
                return ot.join('.') === 'gnome.environment.environment_objects';
            });
            var active_env_objs = [];
            env_objs.forEach(function(obj){
                active_env_objs.push(obj.get('id'));
            });
            this.active_env_objs = active_env_objs;

            for (let i = 0; i < env_objs.length; i++) {
                this.layers.add({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: env_objs[i],
                    id: env_objs[i].id,
                    visObj: env_objs[i]._vectors,
                    appearance: env_objs[i].get('_appearance')
                });
            }
            
            // Create legacy object layers
            var currents = webgnome.model.get('movers').filter(function(mover){
                return [
                    'gnome.movers.current_movers.CatsMover',
                    'gnome.movers.current_movers.GridCurrentMover',
                    'gnome.movers.current_movers.ComponentMover',
                    'gnome.movers.current_movers.CurrentCycleMover',
                ].indexOf(mover.get('obj_type')) !== -1;
            });
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.CurrentJsonOutput'});
            var active_currents = [];
            if(current_outputter.get('on')){
                current_outputter.get('current_movers').forEach(function(mover){
                    active_currents.push(mover.get('id'));
                });
            }
            this.checked_currents = active_currents;

            var ice = webgnome.model.get('movers').filter(function(mover){
                return mover.get('obj_type') === 'gnome.movers.current_movers.IceMover';
            });
            var ice_tc_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.IceJsonOutput'});
            var tc_ice = [];
            ice_tc_outputter.get('ice_movers').forEach(function(mover){
                tc_ice.push(mover.get('id'));
            });
            this.tc_ice = tc_ice;

            //Render HTML
            this.$el.html(_.template(LayersTemplate, {
                model_spills: model_spills,
                currents: currents,
                active_currents: active_currents,
                ice: ice,
                tc_ice: tc_ice,
                env_objs: env_objs,
                active_env_objs: active_env_objs,
            }));
            this.setupLayersTooltips();
            $('#map-modelMap', this.el)[0].checked = this._map_layer.appearance.get('on');
            $('#map-spillableArea', this.el)[0].checked = this._sa_layer.appearance.get('on');
            $('#map-mapBounds', this.el)[0].checked = this._bounds_layer.appearance.get('on');
            for (let k = 0; k < model_spills.length; k++) {
                $('#vis-' + model_spills.models[k].id, this.el)[0].checked = this.layers.findWhere({id: model_spills.models[k].id}).appearance.get('on');
                $('#loc-' + model_spills.models[k].id, this.el)[0].checked = this.layers.findWhere({id: model_spills.models[k].id + '_loc'}).appearance.get('on');
            }
            
        },

        triggerDefaultLayers: function() {
            //this should trigger adds on all layers that are enabled by default. If the layer control starts as 'checked'
            //the corresponding layer should be triggered.
            //TODO: Should read the compiled HTML, not manually as below
            this.trigger('add', this._map_layer);
            for( let i = 0; i < this._spill_layers.length; i++) {
                this.trigger('add', this._spill_layers[0]);
            }
        },

        toggleImageryLayers: function(e) {
            let name = e.target.id.replace('imagery-', '')
            if(this.layers.sat) {
                this.layers.remove(this.layers.sat);
                this.layers.sat = undefined;
            }
            if (name === 'bing_aerial') {
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-bing',
                    visObj: new Cesium.BingMapsImageryProvider({
                        layers: '1',
                        url : 'https://dev.virtualearth.net',
                        key : 'Ai5E0iDKsjSUSXE9TvrdWXsQ3OJCVkh-qEck9iPsEt5Dao8Ug8nsQRBJ41RBlOXM',
                        mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
                    })
                });
                this.layers.add(this.layers.sat);
            } else if (name === 'open_street_map'){
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-osm',
                    visObj: new Cesium.createOpenStreetMapImageryProvider({
                        layers: '1',
                        url : 'https://a.tile.openstreetmap.org/',
                    })
                });
                this.layers.add(this.layers.sat);
            } else if (name === 'noaanavcharts') {
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-noaanav',
                    visObj: new Cesium.WebMapServiceImageryProvider({
                        layers: '1',
                        url: 'http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/services/RNC/NOAA_RNC/MapServer/WMSServer',
                    })
                });
                this.layers.add(this.layers.sat);
            }
        },

        toggleMapLayers: function(e) {
            let mapid = webgnome.model.get('map').get('id');
            let name = e.target.id.replace('map-', '')
            if (name === 'modelMap') {
                if (e.target.checked) {
                    this.layers.findWhere({id: mapid}).appearance.set('on', true);
                } else {
                    this.layers.findWhere({id: mapid}).appearance.set('on', false);
                }
            } else if (name === 'spillableArea') {
                if (e.target.checked) {
                    this.layers.findWhere({id: mapid + '_sa'}).appearance.set('on', true);
                } else {
                    this.layers.findWhere({id: mapid + '_sa'}).appearance.set('on', false);
                }
            } else if ( name === 'mapBounds') {
                if (e.target.checked) {
                    this.layers.findWhere({id: mapid + '_bounds'}).appearance.set('on', true);
                } else {
                    this.layers.findWhere({id: mapid + '_bounds'}).appearance.set('on', false);
                }
            } else if ( name === 'graticule') {
                // Dirty hack because graticule doesn't fit into this framework nicely (yet)
                if (e.target.checked) {
                    webgnome.router.trajView.graticule.activate();
                } else {
                    webgnome.router.trajView.graticule.deactivate();
                }
            } else {
                console.error('invalid control selected');
            }
        },

        toggleSpillLayers: function(e) {
            let sel = e.target.classList[0];
            let name = e.target.id.replace(sel + '-', '');
            if (sel === 'vis') {
                let spillLayer = this.layers.findWhere({id: name});
                if (!e.currentTarget.checked) { //unchecking a box
                    spillLayer.appearance.set('on', false);
                } else {
                    spillLayer.appearance.set('on', true);
                }
            } else if (sel === 'loc') {
                let spillLocLayer = this.layers.findWhere({id: name + '_loc'});
                if (!e.currentTarget.checked) { //unchecking a box
                    spillLocLayer.appearance.set('on', false);
                } else {
                    spillLocLayer.appearance.set('on', true);
                }
            }
            
        },

        toggleLayers: function(e){
/*
            if(e.target.name === 'imagery') {
                this.toggleImageryLayers(e);
            }
            
            var checked_layers = this.checked_layers = [];
            this.$('.layers input:checked').each(function(i, input){
                checked_layers.push(input.id);
            });

            if(checked_layers.indexOf('modelmap') !== -1){
                this.layers.map.show = true;
            } else {
                this.layers.map.show = false;
            }
            
            var part;
            for (var i = 0; i < this.layers.spills.length; i++) {
                if(checked_layers.indexOf('spills-' + this.layers.spills[i]._id) !== -1){                   
                    this.layers.spills[i].show = true;                    
                } else {                    
                    this.layers.spills[i].show = false;
                } 
                
                if(checked_layers.indexOf('particles-'  + this.layers.spills[i]._id) !== -1 && this.layers.particles[i]){
                    for(part = 2; part < this.layers.particles[i].length; part++){
                        this.layers.particles[i].get(part).show = true;
                    }
                } else if(this.layers.particles[i]) {
                    for(part = 2; part < this.layers.particles[i].length; part++){
                        this.layers.particles[i].get(part).show = false;
                    }
                }
                
            }

            var area;
            if(checked_layers.indexOf('spillableArea') !== -1){
                if(!this.layers.spillable){
                    this.layers.spillable = [];
                    var polygons = webgnome.model.get('map').get('spillable_area');
                    for(var poly in polygons){
                        this.layers.spillable.push(this.viewer.entities.add({
                            polygon: {
                                hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(polygons[poly])),
                                material: Cesium.Color.BLUE.withAlpha(0.25),
                                outline: true,
                                outlineColor: Cesium.Color.BLUE.withAlpha(0.75),
                                height: 0,
                            }
                        }));
                    }
                } else {
                    for(area in this.layers.spillable){
                        this.layers.spillable[area].show = true;
                    }
                }
            } else if(this.layers.spillable){
                for(area in this.layers.spillable){
                    this.layers.spillable[area].show = false;
                }
            }

            if(checked_layers.indexOf('map_bounds') !== -1){
                if(!this.layers.bounds){
                    var map = webgnome.model.get('map');
                    this.layers.bounds = this.viewer.entities.add({
                        name: 'Map Bounds',
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(map.get('map_bounds'))),
                            material: Cesium.Color.WHITE.withAlpha(0),
                            outline: true,
                            outlineColor: Cesium.Color.BLUE,
                            height: 0,
                        }
                    });
                } else {
                    this.layers.bounds.show = true;
                }
            } else if(this.layers.bounds){
                this.layers.bounds.show = false;
            }

            if(checked_layers.indexOf('graticule') !== -1) {
                this.graticule.activate();
            } else {
                this.graticule.deactivate();
            }
*/
        },

        close: function(){
            this.$el.hide();
        }
    });
    return layersView;
});