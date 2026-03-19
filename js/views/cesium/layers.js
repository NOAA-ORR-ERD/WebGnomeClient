//arcgis api key
//AAPTxy8BH1VEsoebNVZXo8HurEAdw7ifjrB-vqRTrd0PlJmfeZ9NbAtUf-VfOua8OoQcHw6kVwtiGC6y4t25-C8lFk3bBFXREhayapqEgxz8NBAzpGTup5paOhqDsZj1EZXx9Mc0DY2Aa1HX5QDUiPX66tcGZxBcct5PSvM4w9V9DoPwQIHaUiGFr6TgJ5kedEcQIEBoFYzTr98mMLo_zdEWFiqqy7nKZ7I0Y-77ufcyfS0.AT1_5HAMHzKS
define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'text!templates/cesium/layers.html',
    'views/form/visualization/inspect',
    'model/layer',
], function ($, _, Backbone, BaseView, module, LayersTemplate, InspectForm, LayerModel) {
    "use strict";
    var layersView = BaseView.extend({
        events: {
            'change .imagery_layers input': 'toggleImageryLayers',
            'change .map_layers input': 'toggleMapLayers',
            'change .spills input': 'toggleSpillLayers',
            'click .spill-edit-btn': 'openInspectModal',
            'click .env-grid input': 'toggleGridLayers',
            'click .env-uv input': 'toggleDataLayers',
            'click .env-edit-btn': 'openInspectModal',
            'click .curr-grid input': 'toggleGridLayers',
            'click .curr-uv input': 'toggleDataLayers',
            'click .curr-edit-btn': 'openInspectModal',
            'click .current-grid input': 'toggleGrid',
            'click .current-uv input': 'toggleUV',
            'click .ice-uv input': 'toggleUV',
            'click .layers .title': 'toggleLayerPanel'
        },
        className: 'layers',
        defaultWidth: '300px',

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
            this.listenTo(webgnome.model.get('movers'), 'reset', this.resetCollections);
            this.listenTo(webgnome.model.get('environment'), 'add', this.addLayer);
            this.listenTo(webgnome.model.get('environment'), 'remove', this.removeLayer);
            this.listenTo(webgnome.model.get('environment'), 'change', this.render);
            this.listenTo(webgnome.model.get('environment'), 'reset', this.resetCollections);
            this.listenTo(webgnome.model.get('spills'), 'add', this.addLayer);
            this.listenTo(webgnome.model.get('spills'), 'remove', this.removeLayer);
            this.listenTo(webgnome.model.get('spills'), 'change', this.render);
            this.listenTo(webgnome.model.get('spills'), 'reset', this.resetCollections);
            this.listenTo(webgnome.model, 'change:map', this.addMapListener);
            this.listenTo(webgnome.model, 'change:map', this.resetMap);
            this.listenTo(webgnome.model, 'change:uncertain', this.render);
            // The include of uncertain bounds is currently tied to the json outputter,
            // so listen for a change here
            var json_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'});
            this.listenTo(json_outputter, 'change:include_uncertain_bounds', this.render);
        },

        addMapListener: function(){
            //this.listenTo(webgnome.model.get('map'), 'change', this.resetMap);
        },

        resetCollections: function(a, b, c, d, e){
            console.log(a);
        },

        noaa_charts_display_params: {
            "ECDISParameters": {
                "version":"10.9.1",
                "DynamicParameters": {
                    "Parameter": [
                        {"name":"AreaSymbolizationType","value":2},
                        {"name":"AttDesc","value":2},
                        {"name":"ColorScheme","value":0},
                        {"name":"CompassRose","value":2},
                        {"name":"DataQuality","value":1},
                        {"name":"DateDependencyRange","value":""},
                        {"name":"DateDependencySymbols","value":1},
                        {"name":"DeepContour","value":5.1816},
                        {"name":"DisplayAIOFeatures","value":"1,2,3,4,5,6,7"},
                        {"name":"DisplayBathymetricIENC","value":1},
                        {"name":"DisplayCategory","value":"1,2,4"},
                        {"name":"DisplayDepthUnits","value":2},
                        {"name":"DisplayFrames","value":2},
                        {"name":"DisplayFrameText","value":2},
                        {"name":"DisplayFrameTextPlacement","value":1},
                        {"name":"DisplayLightSectors","value":2},
                        {"name":"DisplayNOBJNM","value":1},
                        {"name":"DisplaySafeSoundings","value":2},
                        {"name":"HonorScamin","value":2},
                        {"name":"IntendedUsage","value":"0"},
                        {"name":"IsolatedDangers","value":1},
                        {"name":"IsolatedDangersOff","value":2},
                        {"name":"LabelContours","value":2},
                        {"name":"LabelSafetyContours","value":2},
                        {"name":"MovingCentroid","value":1},
                        {"name":"OptionalDeepSoundings","value":1},
                        {"name":"PointSymbolizationType","value":2},
                        {"name":"RemoveDuplicateText","value":2},
                        {"name":"SafetyContour","value":3.3528000000000002},
                        {"name":"SafetyDepth","value":30},
                        {"name":"ShallowContour","value":1.524},
                        {"name":"TextHalo","value":2},
                        {"name":"TwoDepthShades","value":1}
                    ],
                    "ParameterGroup":[
                        {
                            "name":"AreaSymbolSize",
                            "Parameter":[
                                {"name":"scaleFactor","value":1},
                                {"name":"minZoom","value":0.05},
                                {"name":"maxZoom","value":1.2}
                            ]
                        },
                        {
                            "name":"DatasetDisplayRange",
                            "Parameter":[
                                {"name":"minZoom","value":0.3},
                                {"name":"maxZoom","value":1.2}
                            ]
                        },
                        {
                            "name":"LineSymbolSize",
                            "Parameter":[
                                {"name":"scaleFactor","value":1},
                                {"name":"minZoom","value":0.75},
                                {"name":"maxZoom","value":1}
                            ]
                        },
                        {
                            "name":"PointSymbolSize",
                            "Parameter":[
                                {"name":"scaleFactor","value":1},
                                {"name":"minZoom","value":0.75},
                                {"name":"maxZoom","value":1}
                            ]
                        },
                        {
                            "name":"TextGroups",
                            "Parameter":[
                                {"name":"11","value":2},
                                {"name":"21","value":2},
                                {"name":"23","value":2},
                                {"name":"24","value":2},
                                {"name":"25","value":2},
                                {"name":"26","value":2},
                                {"name":"27","value":2},
                                {"name":"28","value":2},
                                {"name":"29","value":2},
                                {"name":"30","value":2}
                            ]
                        },
                        {
                            "name":"TextSize",
                            "Parameter":[
                                {"name":"scaleFactor","value":1},
                                {"name":"minZoom","value":0.75},
                                {"name":"maxZoom","value":1}
                            ]
                        }
                    ]
                }
            },
        },

        resetMap: function(e){
            if (this._map_layer && e && e.changed.map.id !== e.previousAttributes().map.id) {
                var oldMap = e.previousAttributes().map;
                this.layers.remove(this.layers.findWhere({id: oldMap.id}));
                this.layers.remove(this.layers.findWhere({id: oldMap.id + '_sa'}));
                this.layers.remove(this.layers.findWhere({id: oldMap.id + '_bounds'}));
                this.$('#map-modelMap').prop('checked', true);
                this.$('#map-spillableArea').prop('checked', false);
                this.$('#map-mapBounds').prop('checked', false);
                this.$('#map-raster').prop('checked', false);
            }
            var map = webgnome.model.get('map');
            this.layers.add(
                [{
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: map,
                    id: map.id,
                    visObj: map._mapVis,
                    appearance: map.get('_appearance')
                },
                {
                    type: 'cesium',
                    parentEl: 'dataSource',
                    model: map,
                    id: map.id + '_sa',
                    visObj: map._spillableVis,
                    appearance: map.get('_appearance')
                },
                {
                    type: 'cesium',
                    parentEl: 'dataSource',
                    model: map,
                    id: map.id + '_bounds',
                    visObj: map._boundsVis,
                    appearance: map.get('_appearance')
                },
                {
                    type: 'cesium',
                    parentEl: 'dataSource',
                    model: map,
                    id: map.id + '_uncertain_bounds',
                    visObj: map._uncertainBoundsVis,
                    appearance: map.get('_appearance')
                }]
            );
            this._map_layer = this.layers.findWhere({id: map.id});
            this._sa_layer = this.layers.findWhere({id: map.id + '_sa'});
            this._bounds_layer = this.layers.findWhere({id: map.id + '_bounds'});
            this._uncertain_bounds_layer = this.layers.findWhere({id: map.id + '_uncertain_bounds'});
            this._raster_layer = this.layers.findWhere({id: map.id + '_raster'});
            if(webgnome.router.trajView) {
                webgnome.router.trajView._flyTo = true;
            }
        },

        setupLayersTooltips: function() {
            this.$('.spill-vis-hdr').tooltip(this.createTooltipObject("Show Particles"));
            this.$('.spill-con-hdr').tooltip(this.createTooltipObject("Show Contours"));
            this.$('.spill-loc-hdr').tooltip(this.createTooltipObject("Show Spill Location"));
            this.$('.spill-edit-hdr').tooltip(this.createTooltipObject("Configure"));
            this.$('.env-grid-hdr').tooltip(this.createTooltipObject("Show Model Grid"));
            this.$('.env-uv-hdr').tooltip(this.createTooltipObject("Show Velocities"));
            this.$('.env-edit-hdr').tooltip(this.createTooltipObject("Configure"));
            this.$('.spill-row').hover(_.bind(this.highlightLEs, this), _.bind(this.unhighlightLEs, this));
            this.$('.spill-con-input').tooltip(this.createTooltipObject("Enable in layer settings ..."));
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

            this.layers.sat = new LayerModel({
                type:'cesium',
                parentEl:'imageryLayer',
                id: 'imagery-osm',
                visObj: new Cesium.OpenStreetMapImageryProvider()
            });
            this.layers.add(this.layers.sat);

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
                    'gnome.movers.c_current_movers.CatsMover',
                    'gnome.movers.c_current_movers.ComponentMover',
                    'gnome.movers.c_current_movers.CurrentCycleMover',
                    'gnome.movers.c_current_movers.c_GridCurrentMover',
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
            var model_map = webgnome.model.get('map');
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
                    'gnome.movers.c_current_movers.CatsMover',
                    'gnome.movers.c_current_movers.c_GridCurrentMover',
                    'gnome.movers.c_current_movers.ComponentMover',
                    'gnome.movers.c_current_movers.CurrentCycleMover',
                ].indexOf(mover.get('obj_type')) !== -1;
            });
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.CurrentJsonOutput'});
            // drop all of the currents from current outputter
            current_outputter.get('current_movers').reset();
            var active_currents = [];
            if(current_outputter.get('on')){
                current_outputter.get('current_movers').forEach(function(mover){
                    active_currents.push(mover.get('id'));
                });
            }
            this.checked_currents = active_currents;

/*             var ice = webgnome.model.get('movers').filter(function(mover){
                return mover.get('obj_type') === 'gnome.movers.c_current_movers.IceMover';
            });
            var ice_tc_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.IceJsonOutput'});
            var tc_ice = [];
            ice_tc_outputter.get('ice_movers').forEach(function(mover){
                tc_ice.push(mover.get('id'));
            });
            this.tc_ice = tc_ice; */

            var json_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'});
            var include_uncertain_bounds = json_outputter.get('include_uncertain_bounds');

            // Before rendering HTML, save expand state of previous control groups
            var show = {panel:false, map:false, spill:false, env:false};
            if (this.$('.in', this.el)[0]) {
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
            var tmpl = _.template(LayersTemplate);
            this.$el.html(tmpl({
                model_spills: model_spills,
                model: webgnome.model,
                currents: currents,
                active_currents: active_currents,
                //ice: ice,
                //tc_ice: tc_ice,
                env_objs: env_objs,
                active_env_objs: active_env_objs,
                include_uncertain_bounds: include_uncertain_bounds
            }));

            //Expand newly rendered control groups as necessary
            if (show.panel) {
                this.$('.layers', this.$el).addClass('in');
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
            $('#map-modelMap', this.el)[0].checked = this._map_layer.getAppearance().get('map_on');
            $('#map-spillableArea', this.el)[0].checked = this._sa_layer.getAppearance().get('sa_on');
            $('#map-mapBounds', this.el)[0].checked = this._bounds_layer.getAppearance().get('bounds_on');
            if ($('#map-uncertainParticlesOn', this.el).length) {
                $('#map-uncertainParticlesOn', this.el)[0].checked = this._map_layer.getAppearance().get('uncertain_particles_on');
            }
            if ($('#map-uncertainBoundsOn', this.el).length) {
                $('#map-uncertainBoundsOn', this.el)[0].checked = this._map_layer.getAppearance().get('uncertain_bounds_on');
            }
            for (var k = 0; k < model_spills.length; k++) {
                $('#vis-' + model_spills.models[k].id, this.el)[0].checked = this.layers.findWhere({id: model_spills.models[k].id}).getAppearance().get('les_on');
                var include_certain_contours = this.layers.findWhere({id: model_spills.models[k].id}).getAppearance().get('include_certain_contours');
                if (!!include_certain_contours) {
                    $('#con-' + model_spills.models[k].id, this.el)[0].disabled = false;
                    $('#con-' + model_spills.models[k].id, this.el)[0].checked = this.layers.findWhere({id: model_spills.models[k].id}).getAppearance().get('contours_on');
                    $('#con-' + model_spills.models[k].id, this.el).tooltip('disable');
                } else {
                    // Disable the checkbox if we dont have contours for this spill
                    $('#con-' + model_spills.models[k].id, this.el)[0].disabled = true;
                    $('#con-' + model_spills.models[k].id, this.el)[0].checked = false;
                    $('#con-' + model_spills.models[k].id, this.el).tooltip('enable');
                }
                $('#loc-' + model_spills.models[k].id, this.el)[0].checked = this.layers.findWhere({id: model_spills.models[k].id + '_loc'}).getAppearance().get('pin_on');
            }
            var lay_id;
            var grid_checkboxes = $('.grid:input', this.el);
            var l;
            for ( k = 0; k < grid_checkboxes.length; k++) {
                lay_id = grid_checkboxes[k].classList[0];
                l = this.layers.findWhere({id: lay_id});
                if (l && (l.getAppearance().get('on') || l.getAppearance().get('grid_on'))) {
                    grid_checkboxes[k].click();
                    //l.model.renderLines(3000);
                }
            }
            var env_checkboxes = $('.uv:input', this.el);
            for (k = 0; k < env_checkboxes.length; k++) {
                lay_id = env_checkboxes[k].id;
                l = this.layers.findWhere({id: lay_id});
                if (l && (l.getAppearance().get('on') || l.getAppearance().get('vec_on'))) {
                    env_checkboxes[k].click();
                }
            }
            this.$el.css('width', this.defaultWidth);
            this.$el.css('height', this.$el.siblings('.tab-container').css('width'));
            this._rendered = true;
        },

        addLayer: function(e) {
            if (webgnome.collectionContains(webgnome.model.get('movers'), e) &&
                e.get('obj_type') === 'gnome.movers.c_current_movers.CatsMover' ||
                e.get('obj_type') === 'gnome.movers.c_current_movers.ComponentMover' ||
                e.get('obj_type') === 'gnome.movers.c_current_movers.CurrentCycleMover' ||
                e.get('obj_type') === 'gnome.movers.c_current_movers.c_GridCurrentMover') {
                this.layers.add({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: e,
                    id: 'uv-' + e.get('id'),
                    visObj: e._vectors,
                });
                this.layers.add({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: e,
                    id: 'grid-' + e.get('id'),
                    visObj: e._linesPrimitive,
                });
            }
            if (webgnome.collectionContains(webgnome.model.get('environment'), e) && e.get('obj_type').includes('gnome.environment.environment_objects')) {
                this.layers.add({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: e,
                    id: 'uv-' + e.get('id'),
                    visObj: e._vectors,
                });
                if (e.has('grid') && !this.layers.findWhere({id:e.get('grid').get('id')})) {
                    this.layers.add({
                        type: 'cesium',
                        parentEl: 'primitive',
                        model: e.get('grid'),
                        id: 'grid-' + e.get('grid').get('id'),
                        visObj: e.get('grid')._linesPrimitive,
                    });
                }
            }
            if (webgnome.collectionContains(webgnome.model.get('spills'), e)) {
                var spillLayer = new LayerModel({
                    type: 'cesium',
                    parentEl: 'primitive',
                    model: e,
                    id: e.get('id'),
                    visObj: e.les,
                });
                var spillCertainContoursLayer = new LayerModel({
                    type: 'cesium',
                    parentEl: 'dataSource',
                    model: e,
                    id: e.get('id') + '_certain_contours',
                    visObj: e.certain_contours,
                });
                var spillLocLayer = new LayerModel({
                    type: 'cesium',
                    parentEl: 'dataSource',
                    model: e,
                    id: e.get('id') + '_loc',
                    visObj: e._locVis,
                });
                this.layers.add([ spillCertainContoursLayer, spillLocLayer, spillLayer]);
            }
            if(this._rendered) {
                this.render();
            }
        },

        removeLayer: function(e) {
            var lays;
            lays = this.layers.where({model: e});
            this.layers.remove(lays);
            //All layers whose id field contain the id of the model also get removed.
            lays = this.layers.filter(function(lay) {
                return lay.get('model') &&
                lay.get('model').get('_appearance') &&
                lay.get('model').get('_appearance').get('id') &&
                lay.get('model').get('_appearance').get('id').indexOf(e.get('id')) !== -1;
            });
            this.layers.remove(lays);
            if (e.has('grid')) {
                lays = this.layers.where({model:e.get('grid')});
                this.layers.remove(lays);
            }
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
                if (!!l) {
                    l.model.resetLEs();
                }
            }
            // Reset the uncertain bounds as it is a map object
            var map = webgnome.model.get('map');
            map.resetUncertainBounds();
        },

        toggleImageryLayers: function(e) {
            var name = e.target.id.replace('imagery-', '');
            if(this.layers.sat) {
                this.layers.remove(this.layers.sat);
                this.layers.sat = undefined;
            }
            if (name === 'no_image') {
                this.layers.sat = new LayerModel({
                    type: 'cesium',
                    parentEl: 'imageryLayer',
                    id: 'imagery-none',
                    visObj: Cesium.SingleTileImageryProvider.fromUrl('/img/globe.png')
                });
                this.layers.add(this.layers.sat);
            } else if (name === 'noaanavcharts') {
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-noaanav',
                    layerOptions: {
                        alpha: 1
                    },
                    visObj: new Cesium.UrlTemplateImageryProvider({
                        url : 'https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/MapServer/export?' +
                        'F=image&FORMAT=PNG32&TRANSPARENT=true' +
                        '&display_params=%7B%22ECDISParameters%22%3A%7B%22version%22%3A%2210.9.1%22%2C%22DynamicParameters%22%3A%7B%22Parameter%22%3A%5B%7B%22name%22%3A%22AreaSymbolizationType%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22AttDesc%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22ColorScheme%22%2C%22value%22%3A0%7D%2C%7B%22name%22%3A%22CompassRose%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22DataQuality%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22DateDependencyRange%22%2C%22value%22%3A%22%22%7D%2C%7B%22name%22%3A%22DateDependencySymbols%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22DeepContour%22%2C%22value%22%3A5.1816%7D%2C%7B%22name%22%3A%22DisplayAIOFeatures%22%2C%22value%22%3A%221%2C2%2C3%2C4%2C5%2C6%2C7%22%7D%2C%7B%22name%22%3A%22DisplayBathymetricIENC%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22DisplayCategory%22%2C%22value%22%3A%221%2C2%2C4%22%7D%2C%7B%22name%22%3A%22DisplayDepthUnits%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22DisplayFrames%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22DisplayFrameText%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22DisplayFrameTextPlacement%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22DisplayLightSectors%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22DisplayNOBJNM%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22DisplaySafeSoundings%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22HonorScamin%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22IntendedUsage%22%2C%22value%22%3A%220%22%7D%2C%7B%22name%22%3A%22IsolatedDangers%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22IsolatedDangersOff%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22LabelContours%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22LabelSafetyContours%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22MovingCentroid%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22OptionalDeepSoundings%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22PointSymbolizationType%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22RemoveDuplicateText%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22SafetyContour%22%2C%22value%22%3A3.3528000000000002%7D%2C%7B%22name%22%3A%22SafetyDepth%22%2C%22value%22%3A30%7D%2C%7B%22name%22%3A%22ShallowContour%22%2C%22value%22%3A1.524%7D%2C%7B%22name%22%3A%22TextHalo%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22TwoDepthShades%22%2C%22value%22%3A1%7D%5D%2C%22ParameterGroup%22%3A%5B%7B%22name%22%3A%22AreaSymbolSize%22%2C%22Parameter%22%3A%5B%7B%22name%22%3A%22scaleFactor%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22minZoom%22%2C%22value%22%3A0.05%7D%2C%7B%22name%22%3A%22maxZoom%22%2C%22value%22%3A1.2%7D%5D%7D%2C%7B%22name%22%3A%22DatasetDisplayRange%22%2C%22Parameter%22%3A%5B%7B%22name%22%3A%22minZoom%22%2C%22value%22%3A0.3%7D%2C%7B%22name%22%3A%22maxZoom%22%2C%22value%22%3A1.2%7D%5D%7D%2C%7B%22name%22%3A%22LineSymbolSize%22%2C%22Parameter%22%3A%5B%7B%22name%22%3A%22scaleFactor%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22minZoom%22%2C%22value%22%3A0.75%7D%2C%7B%22name%22%3A%22maxZoom%22%2C%22value%22%3A1%7D%5D%7D%2C%7B%22name%22%3A%22PointSymbolSize%22%2C%22Parameter%22%3A%5B%7B%22name%22%3A%22scaleFactor%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22minZoom%22%2C%22value%22%3A0.75%7D%2C%7B%22name%22%3A%22maxZoom%22%2C%22value%22%3A1%7D%5D%7D%2C%7B%22name%22%3A%22TextGroups%22%2C%22Parameter%22%3A%5B%7B%22name%22%3A%2211%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2221%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2223%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2224%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2225%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2226%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2227%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2228%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2229%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%2230%22%2C%22value%22%3A2%7D%5D%7D%2C%7B%22name%22%3A%22TextSize%22%2C%22Parameter%22%3A%5B%7B%22name%22%3A%22scaleFactor%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22minZoom%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22maxZoom%22%2C%22value%22%3A2%7D%5D%7D%5D%7D%7D%7D' +
                        '&frames_on=false&LAYERS=show%3AShow%3A0%2C1%2C2%2C3%2C4%2C5%2C6%2C7' +
                        '&SIZE=512%2C512' + //SIZE controls resolution requested
                        '&BBOX={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}' +
                        '&BBOXSR=3857&IMAGESR=3857&DPI=90',
                    })
                });
                this.layers.add(this.layers.sat);
            } else if (name === 'bing_aerial') { //DISABLED
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-bing',
                    visObj: Cesium.BingMapsImageryProvider.fromUrl(
                        '//dev.virtualearth.net',
                        {
                            layers: '1',
                            key : 'Ai5E0iDKsjSUSXE9TvrdWXsQ3OJCVkh-qEck9iPsEt5Dao8Ug8nsQRBJ41RBlOXM',
                            mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
                        }
                    ).then(LayerModel.prototype.visObjPromiseResolver)
                });
                this.layers.add(this.layers.sat);
            } else if (name === 'usgs') {
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-usgs',
                    visObj: new Cesium.WebMapTileServiceImageryProvider({
                            url : 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/tile/1.0.0/USGSTopo/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
                            layer : 'USGSTopo',
                            style : 'default',
                            format : 'image/jpeg',
                            tileMatrixSetID : 'default028mm',
                            maximumLevel: 19,
                            credit: "USGS The National Map: National Boundaries Dataset, 3DEP Elevation Program, Geographic Names Information System, National Hydrography Dataset, National Land Cover Database, National Structures Dataset, and National Transportation Dataset; USGS Global Ecosystems; U.S. Census Bureau TIGER/Line data; USFS Road data; Natural Earth Data; U.S. Department of State HIU; NOAA National Centers for Environmental Information. Data refreshed July 22, 2025."
                        }),
                });
                // this.layers.sat = new LayerModel({
                //     type:'cesium',
                //     parentEl:'imageryLayerCollection',
                //     id: 'imagery-usgs',
                //     visObj: [
                //         new Cesium.WebMapTileServiceImageryProvider({
                        //     url : 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/WMTS/tile/1.0.0/USGSImageryOnly/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
                        //     layer : 'USGSImageryOnly',
                        //     style : 'default',
                        //     format : 'image/jpeg',
                        //     tileMatrixSetID : 'default028mm',
                        //     maximumLevel: 19,
                        //     credit : new Cesium.Credit('U. S. Geological Survey')
                        // }),
                //         new Cesium.WebMapTileServiceImageryProvider({
                //             url : 'https://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer/WMTS/tile/1.0.0/USGSShadedReliefOnly/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
                //             layer : 'USGSShadedReliefOnly',
                //             style : 'labels',
                //             format : 'image/jpeg',
                //             tileMatrixSetID : 'default028mm',
                //             maximumLevel: 19,
                //             credit : new Cesium.Credit('U. S. Geological Survey')
                //         }),
                //     ]
                // });
                this.layers.add(this.layers.sat);
            } else if (name === 'esriocean') {
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-esriocean',
                    visObj: new Cesium.WebMapTileServiceImageryProvider({
                            url : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/WMTS/tile/1.0.0/World_Imagery/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
                            layer : '0,1,2,3,4',
                            style : 'default',
                            tileMatrixSetID: 'default028mm',
                            credit: 'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
                        }),
                });
                this.layers.add(this.layers.sat);
            } else if (name === 'open_street_map'){ //DISABLED
                this.layers.sat = new LayerModel({
                    type:'cesium',
                    parentEl:'imageryLayer',
                    id: 'imagery-osm',
                    visObj: new Cesium.OpenStreetMapImageryProvider()
                });
                this.layers.add(this.layers.sat);
            }
            this.trigger('requestRender');
        },

        toggleMapLayers: function(e) {
            var mapid = webgnome.model.get('map').get('id');
            var layer = this.layers.findWhere({id:mapid});
            var name = e.currentTarget.name;
            if (name === 'graticule') {
                // Dirty hack because graticule doesn't fit into this framework nicely (yet)
                if (e.target.checked) {
                    webgnome.router.trajView.graticule.activate();
                } else {
                    webgnome.router.trajView.graticule.deactivate();
                }
            } else if (name === 'raster_on'){
                layer = this.layers.findWhere({id: mapid + '_raster'});
                if (e.target.checked && _.isUndefined(layer)) {
                    var map = webgnome.model.get('map');
                    map.getRaster().then(_.bind( function(raster) {
                        layer =
                        {
                            type: 'cesium',
                            parentEl: 'entity',
                            model: map,
                            id: map.id + '_raster',
                            visObj: map.processRaster(raster),
                            appearance: map.get('_appearance')
                        };
                        layer.getAppearance().set(name, e.currentTarget.checked);
                        layer.visObj.show = e.currentTarget.checked;
                        this.layers.add(layer);
                        this._raster_layer = layer;
                        this.trigger('requestRender');
                    }, this));
                } else {
                    layer.getAppearance().set(name, e.currentTarget.checked);
                    layer.visObj.show = e.currentTarget.checked;
                }
            } else if (name === 'uncertain_particles_on'){
                // Find all particle layers (one per spill), and turn off the uncertain particles
                var layers = this.layers.filter((x) => {
                    return !!x.model && !_.isUndefined(x.model.toggleUncertainParticles);
                });
                _.each(layers, (l) => {
                    l.model.toggleUncertainParticles(e.currentTarget.checked);
                });
                webgnome.model.get('map').get('_appearance').set(name, e.currentTarget.checked);
            } else if (name === 'uncertain_bounds_on'){

                var output = (webgnome.model.get('outputters')
                              .findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'}));
                output.set('include_uncertain_bounds', e.currentTarget.checked, {silent:true});
                // We only have one uncertain bounds layer, toggle it
                layer = this.layers.findWhere({id: mapid + '_uncertain_bounds'});
                layer.visObj.show = e.currentTarget.checked;
                layer.getAppearance().set(name, e.currentTarget.checked, {silent:true});
                webgnome.model.save();
                //this.trigger('replayCurrentStep');
            } else {
                // this is also done in updateVis but location files seem to need it twice
                // it might work to only do it here
                if (name === 'sa_on') {
                    layer = this.layers.findWhere({id: mapid + '_sa'});
                }
                else if (name === 'bounds_on') {
                    layer = this.layers.findWhere({id: mapid + '_bounds'});
                }
                layer.visObj.show = e.currentTarget.checked;
                layer.getAppearance().set(name, e.currentTarget.checked);
            }
            this.trigger('requestRender');
        },

        toggleSpillLayers: function(e) {
            var id = e.target.id.split('-').slice(1).join('-');
            var name = e.currentTarget.name;
            var layer;
            // We lazy load the contours (i.e. dont spend time loading the json
            // if they are not on)... so if we turn them on we need to load the current step
            if (name === 'contours_on') {
                layer = this.layers.findWhere({id: id+'_certain_contours'});
                layer.getAppearance().set(name, e.currentTarget.checked);
                this.trigger('replayCurrentStep');
            } else {
                layer = this.layers.findWhere({id: id});
                layer.getAppearance().set(name, e.currentTarget.checked);
            }
            this.trigger('requestRender');
        },

        toggleGridLayers: function(e) {
            var grid_id, i;
            var name = e.currentTarget.name;
            if (!name) { console.error('No name on input element');} else { console.log(name);}
            if (e.currentTarget.id === 'none-grid') {
                var grids = this.$('.env-grid input:checked,.curr-grid input:checked');
                for(i = 0; i < grids.length; i++) {
                    if(grids[i].id !== 'none-grid' && grids[i].checked){
                        grids[i].checked = false;
                        grid_id = grids[i].classList[0];
                        var lay = this.layers.findWhere({id: grid_id});
                        lay.getAppearance().set(grids[i].name, false);
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
                    grid_layer.getAppearance().set(name, false);
                } else {
                    this.$('.env-grid #none-grid').prop('checked', false);
                    grid_checkboxes = $(e.currentTarget.classList[0]);
                    for (i = 0; i < grid_checkboxes.length; i++) {
                        grid_checkboxes[i].checked = true;
                    }
                    grid_layer.getAppearance().set(name, true);
                    grid_layer.model.renderLines(3000, false).then(_.bind(function() {this.trigger('requestRender');}, this));
                }
            }
            this.trigger('requestRender');
        },

        toggleDataLayers: function(e) {
            var envs = this.$('.env-uv input:checked,.curr-uv input:checked');
            var name = e.currentTarget.name;
            if (!name && e.currentTarget.id !== 'none-uv') { console.error('No name on input element');} else { console.log(name);}
            var env_id, lay;

            if (e.currentTarget.id === 'none-uv') {
                for (var i = 0; i < envs.length; i++) {
                    if (envs[i].id !== 'none-uv' && envs[i].checked) {
                        env_id = envs[i].id;
                        lay = this.layers.findWhere({id: env_id});
                        envs[i].checked = false;
                        lay.getAppearance().set(envs[i].name, false);

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
                    lay.getAppearance().set(name, false);
                } else {
                    this.$('.env-uv, #none-uv').prop('checked', false);
                    lay.getAppearance().set(name, true);
                    if (lay.model.getVecs) {
                        lay.model.getVecs().then(lay.model.genVectors().then(_.bind(function() {this.trigger('requestRender');}, this)));
                    } else {
                        lay.model.genVectors().then(_.bind(function() {this.trigger('requestRender');}, this));
                    }
                }
            }
            this.trigger('requestRender');
        },

        openInspectModal: function(e) {
            var obj_id = e.currentTarget.id.replace('attr-', '');
            var l = this.layers.findWhere({id: 'uv-' + obj_id});
            if (!l) {
                l = this.layers.findWhere({id: obj_id});
            }
            var mod = new InspectForm(null, l);
            mod.render();
            var idx = setInterval(_.bind(function(){ this.trigger('requestRender'); }, this), 250);
            this.listenTo(mod, 'rerender', this.render);
            // Also any children
            mod.appearanceModelsUsed.forEach(_.bind(function(a) {
                    this.listenTo(a, 'rerender', this.render);
            }, this));
            this.listenTo(mod, 'rerender', _.bind(function() {this.trigger('requestRender');}, this));
            this.listenTo(mod, 'hidden', function() {clearInterval(idx);});
        },

        changeName: function(e) {
            var l = this.layers.findWhere({id: e.get('id')});
            if (l) {
                this.$('#name-' + l.id).text(e.get('name'));
            }
        },

        highlightLEs: function(e) {
            var id = $('.spill-name', e.currentTarget)[0].id.split('-').slice(1).join('-');
            var sp = webgnome.model.get('spills').findWhere({'id': id});
            var curscale = sp.get('_appearance').get('scale');
            for(var i = 0; i < sp.les.length; i++) {
                sp.les._billboards[i].scale = curscale*1.3;
            }
            //sp._locVis.billboard.scale = 1.3;
            this.trigger('requestRender');
        },

        unhighlightLEs: function(e) {
            var id = $('.spill-name', e.currentTarget)[0].id.split('-').slice(1).join('-');
            var sp = webgnome.model.get('spills').findWhere({'id': id});
            var curscale = sp.get('_appearance').get('scale');
            for(var i = 0; i < sp.les.length; i++) {
                sp.les._billboards[i].scale = curscale;
            }
            //sp._locVis.billboard.scale = 1.0;
            this.trigger('requestRender');
        },

        close: function(){
            this.$el.hide();
        }
    });
    return layersView;
});
