define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'views/base',
    'module',
    'text!templates/model/trajectory/layers.html',
    'moment',
    'views/form/inspect',
    'model/layer',
    'model/appearance',
], function ($, _, Backbone, Cesium, BaseView, module, LayersTemplate, moment, InspectForm, LayerModel, Appearance) {
    "use strict";
    var layersView = BaseView.extend({
        events: {
            'change .imagery_layers input': 'toggleImageryLayers',
            'change .map_layers input': 'toggleMapLayers',
            'change .spills input': 'toggleSpillLayers',
            'click .env-grid input': 'toggleGridLayers',
            'click .env-uv input': 'toggleDataLayers',
            'click .env-edit-btn': 'openInspectModal',
            'click .curr-grid input': 'toggleGridLayers',
            'click .curr-uv input': 'toggleDataLayers',
            'click .curr-edit-btn': 'openInspectModal',
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
            this._rendered = false;
        },

        modelListeners: function(){
            this.listenTo(webgnome.model.get('movers'), 'add', this.addLayer);
            this.listenTo(webgnome.model.get('movers'), 'remove', this.removeLayer);
            this.listenTo(webgnome.model.get('movers'), 'change', this.render);
            this.listenTo(webgnome.model.get('environment'), 'add', this.addLayer);
            this.listenTo(webgnome.model.get('environment'), 'remove', this.removeLayer);
            this.listenTo(webgnome.model.get('environment'), 'change', this.render);
            this.listenTo(webgnome.model.get('spills'), 'add', this.addLayer);
            this.listenTo(webgnome.model.get('spills'), 'remove', this.removeLayer);
            this.listenTo(webgnome.model.get('spills'), 'change', this.render);
            this.listenTo(webgnome.model, 'change:map', this.addMapListener);
            this.listenTo(webgnome.model, 'change:map', this.resetMap);
        },

        addMapListener: function(){
            //this.listenTo(webgnome.model.get('map'), 'change', this.resetMap);
        },

        resetMap: function(e){
            if (this._map_layer && e && e.changed.map.id !== e.previousAttributes().map.id) {
                var oldMap = e.previousAttributes().map;
                this.layers.remove(this.layers.findWhere({id: oldMap.id}));
                this.layers.remove(this.layers.findWhere({id: oldMap.id + '_sa'}));
                this.layers.remove(this.layers.findWhere({id: oldMap.id + '_bounds'}));
            }
            var map = webgnome.model.get('map');
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
            if(webgnome.router.trajView) {
                webgnome.router.trajView._flyTo = true;
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

        addDefaultLayers: function() {
            //Runs on first render to add layers for each existing model component.
            this.resetMap();
            var model_spills = webgnome.model.get('spills');
            for (var i = 0; i < model_spills.length; i++) {
                this.addLayer(model_spills.models[i]);
            }
            var env_objs = webgnome.model.get('environment').filter(function(obj) {
                var ot = obj.get('obj_type').split('.');
                ot.pop();
                return ot.join('.') === 'gnome.environment.environment_objects';
            });
            for (i = 0; i < env_objs.length; i++) {
                this.addLayer(env_objs[i]);
            }

            //legacy grid object layers
            var currents = webgnome.model.get('movers').filter(function(mover){
                return [
                    'gnome.movers.current_movers.CatsMover',
                    'gnome.movers.current_movers.GridCurrentMover',
                ].indexOf(mover.get('obj_type')) !== -1;
            });
            for (i = 0; i < currents.length; i++) {
                this.addLayer(currents[i]);
            }
        },

        render: function(e){
            // only compile the template if the map isn't drawn yet
            // or if there is a redraw request because of the map object changing

            // Create map layers
/*
            if (e) {
                if (!this.layers.findWhere({id:e.get('id')})) {
                    var l = new LayerModel();
                }
            }
*/
            if(this.layers.length === 0) {
                this.addDefaultLayers();
            }
            // Create spill layers 
            var model_spills = webgnome.model.get('spills');
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

            // Before rendering HTML, save expand state of previous control groups
            var show = {panel:false, map:false, spill:false, env:false};
            if (this.$('.expanded', this.el)[0]) {
                show.panel = true;
                if (this.$('#map_display', this.el).hasClass('in')) {
                    show.map = true;
                }
                if (this.$('#spills', this.el).hasClass('in')) {
                    show.spill = true;
                }
                if (this.$('#env_objs', this.el).hasClass('in')) {
                    show.env = true;
                }
            }
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

            //Expand newly rendered control groups as necessary
            if (show.panel) {
                this.$('.layers', this.$el).addClass('expanded');
            }
            if (show.map) {
                this.$('#map_display', this.$el).collapse('show');
            }
            if (show.spill) {
                this.$('#spills', this.$el).collapse('show');
            }
            if (show.env) {
                this.$('#env_objs', this.$el).collapse('show');
            }

            this.setupLayersTooltips();
            $('#map-modelMap', this.el)[0].checked = this._map_layer.appearance.get('on');
            $('#map-spillableArea', this.el)[0].checked = this._sa_layer.appearance.get('on');
            $('#map-mapBounds', this.el)[0].checked = this._bounds_layer.appearance.get('on');
            for (var k = 0; k < model_spills.length; k++) {
                $('#vis-' + model_spills.models[k].id, this.el)[0].checked = this.layers.findWhere({id: model_spills.models[k].id}).appearance.get('on');
                $('#loc-' + model_spills.models[k].id, this.el)[0].checked = this.layers.findWhere({id: model_spills.models[k].id + '_loc'}).appearance.get('on');
            }
            var lay_id;
            var grid_checkboxes = $('.grid:input', this.el);
            var l;
            for ( k = 0; k < grid_checkboxes.length; k++) {
                lay_id = grid_checkboxes[k].classList[0];
                l = this.layers.findWhere({id: lay_id});
                if (l && l.appearance.get('on')) {
                    grid_checkboxes[k].click();
                    //l.model.renderLines(3000);
                }
            }
            var env_checkboxes = $('.uv:input', this.el);
            for (k = 0; k < env_checkboxes.length; k++) {
                lay_id = env_checkboxes[k].id;
                l = this.layers.findWhere({id: lay_id});
                if (l && l.appearance.get('on')) {
                    env_checkboxes[k].click();
                }
            }
            this._rendered = true;
        },

        addLayer: function(e) {
            if (e.collection === webgnome.model.get('movers') &&
                e.get('obj_type') === 'gnome.movers.current_movers.CatsMover' ||
                e.get('obj_type') === 'gnome.movers.current_movers.GridCurrentMover') {
                this.layers.add({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: e,
                    id: 'uv-' + e.get('id'),
                    visObj: e._vectors,
                    appearance: e.get('_appearance').findWhere({id: 'uv'})
                });
                this.layers.add({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: e,
                    id: 'grid-' + e.get('id'),
                    visObj: e._linesPrimitive,
                    appearance: e.get('_appearance').findWhere({id: 'grid'})
                });
            }
            if (e.collection === webgnome.model.get('environment') && e.get('obj_type').includes('gnome.environment.environment_objects')) {
                this.layers.add({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: e,
                    id: 'uv-' + e.get('id'),
                    visObj: e._vectors,
                    appearance: e.get('_appearance')
                });
                if (e.has('grid')) {
                    this.layers.add({
                        type: 'cesium',
                        parentEl: 'primitive',
                        model: e.get('grid'),
                        id: 'grid-' + e.get('grid').get('id'),
                        visObj: e.get('grid')._linesPrimitive,
                        appearance: e.get('grid').get('_appearance')
                    });
                }
            }
            if (e.collection === webgnome.model.get('spills')) {
                var spillLayer = new LayerModel({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: e,
                    id: e.get('id'),
                    visObj: e.les,
                    appearance: e.get('_appearance').findWhere({id:'les'})
                });
                var spillLocLayer = new LayerModel({
                    type: 'cesium',
                    parentEl: 'entity',
                    model: e,
                    id: e.get('id') + '_loc',
                    visObj: e._locVis,
                    appearance: e.get('_appearance').findWhere({id:'loc'})
                });
                this.layers.add([ spillLayer, spillLocLayer]);
            }
            if(this._rendered) {
                this.render();
            }
        },

        removeLayer: function(e) {
            var lays;
            lays = this.layers.where({model: e});
            this.layers.remove(lays);
            if(this._rendered) {
                this.render();
            }
        },

        triggerDefaultLayers: function() {
            //this should trigger adds on all layers that are enabled by default. If the layer control starts as 'checked'
            //the corresponding layer should be triggered.
            //TODO: Should read the compiled HTML, not manually as below
            this.trigger('add', this._map_layer);
            for(var i = 0; i < this._spill_layers.length; i++) {
                this.trigger('add', this._spill_layers[0]);
            }
        },

        resetSpills: function() {
            var spills = webgnome.model.get('spills');
            for (var i = 0; i < spills.length; i++) {
                var l = this.layers.findWhere({id:spills.models[i].get('id')});
                l.model.resetLEs();
            }
        },

        toggleImageryLayers: function(e) {
            var name = e.target.id.replace('imagery-', '');
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
                        url : '//dev.virtualearth.net',
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
                        url : '//a.tile.openstreetmap.org/',
                    })
                });
                this.layers.add(this.layers.sat);
            } else if (name === 'noaanavcharts') {
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-noaanav',
                    visObj: new Cesium.WebMapServiceImageryProvider({
                        layers: '0,1',
                        tilingScheme: new Cesium.WebMercatorTilingScheme(),
                        url: '//seamlessrnc.nauticalcharts.noaa.gov/arcgis/services/RNC/NOAA_RNC/MapServer/WMSServer',
                    })
                });
                this.layers.add(this.layers.sat);
            }
        },

        toggleMapLayers: function(e) {
            var mapid = webgnome.model.get('map').get('id');
            var name = e.target.id.replace('map-', '');
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
            var sel = e.target.classList[0];
            var name = e.target.id.replace(sel + '-', '');
            if (sel === 'vis') {
                var spillLayer = this.layers.findWhere({id: name});
                if (!e.currentTarget.checked) { //unchecking a box
                    spillLayer.appearance.set('on', false);
                } else {
                    spillLayer.appearance.set('on', true);
                }
            } else if (sel === 'loc') {
                var spillLocLayer = this.layers.findWhere({id: name + '_loc'});
                if (!e.currentTarget.checked) { //unchecking a box
                    spillLocLayer.appearance.set('on', false);
                } else {
                    spillLocLayer.appearance.set('on', true);
                }
            }
            
        },

        toggleGridLayers: function(e) {
            var grid_id, i;
            if (e.currentTarget.id === 'none-grid') {
                var grids = this.$('.env-grid input:checked,.curr-grid input:checked');
                for(i = 0; i < grids.length; i++) {
                    if(grids[i].id !== 'none-grid' && grids[i].checked){
                        grids[i].checked = false;
                        grid_id = grids[i].classList[0];
                        var lay = this.layers.findWhere({id: grid_id});
                        lay.appearance.set('on', false);
                    }
                }
                if(!e.currentTarget.checked) {
                    e.preventDefault();
                }
            } else {
                var grid_checkboxes;
                grid_id = e.currentTarget.classList[0];
                var grid_layer = this.layers.findWhere({id: grid_id});
                if (!e.currentTarget.checked) { //unchecking a box
                    if (this.$('.env-grid input:checked,.curr-grid input:checked').length === 0) {
                        this.$('.env-grid #none-grid').prop('checked', true);
                    }
                    // Because grids can be shared, we must turn off all checkboxes that match this grid
                    grid_checkboxes = $(e.currentTarget.classList[0]);
                    for (i = 0; i < grid_checkboxes.length; i++) {
                        grid_checkboxes[i].checked = false;
                    }
                    grid_layer.appearance.set('on', false);
                } else {
                    this.$('.env-grid #none-grid').prop('checked', false);
                    grid_checkboxes = $(e.currentTarget.classList[0]);
                    for (i = 0; i < grid_checkboxes.length; i++) {
                        grid_checkboxes[i].checked = true;
                    }
                    grid_layer.appearance.set('on', true);
                    grid_layer.model.renderLines(3000);
                }
            }
        },

        toggleDataLayers: function(e) {
            var envs = this.$('.env-uv input:checked,.curr-uv input:checked');
            var env_id, lay;

            if (e.currentTarget.id === 'none-uv') {
                for (var i = 0; i < envs.length; i++) {
                    if (envs[i].id !== 'none-uv' && envs[i].checked) {
                        env_id = envs[i].id;
                        lay = this.layers.findWhere({id: env_id});
                        envs[i].checked = false;
                        lay.appearance.set('on', false);
                        
                    }
                }
                if(!e.currentTarget.checked) {
                    e.preventDefault();
                }
            } else {
                env_id = e.currentTarget.id;
                lay = this.layers.findWhere({id: env_id});
                if (!e.currentTarget.checked) { //unchecking a box
                    if (this.$('.env-uv input:checked,.curr-uv input:checked').length === 0) {
                        this.$('.env-uv #none-uv').prop('checked', true);
                    }
                    lay.appearance.set('on', false);
                } else {
                    this.$('.env-uv, #none-uv').prop('checked', false);
                    lay.appearance.set('on', true);
                    lay.model.genVectors();
                }
            }
        },

        openInspectModal: function(e) {
            var obj_id = e.currentTarget.id.replace('attr-', '');
            var l = this.layers.findWhere({id: 'uv-' + obj_id});
            var mod = new InspectForm(null, l);
            mod.render();
        },

        changeName: function(e) {
            var l = this.layers.findWhere({id: e.get('id')});
            if (l) {
                this.$('#name-' + l.id).text(e.get('name'));
            }
        },

        close: function(){
            this.$el.hide();
        }
    });
    return layersView;
});