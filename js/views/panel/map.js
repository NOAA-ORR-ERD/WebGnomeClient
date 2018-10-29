define([
    'jquery',
    'underscore',
    'backbone',
    'ol',
    'views/panel/base',
    'views/default/map',
    'model/map/map',
    'views/form/map/type',
    'views/form/map/param',
    'text!templates/panel/map.html',
    'views/modal/form'
], function($, _, Backbone, ol, BasePanel, OlMapView, MapModel, MapTypeForm, ParamMapForm, MapPanelTemplate, FormModal){
    var mapPanel = BasePanel.extend({
        className: 'col-md-3 map object panel-view',

        events:{
            'click .perm-add': 'new',
            'click .add': 'load',
        },

        models: [
            'gnome.model.Model',
            'gnome.map.GnomeMap',
            'gnome.map.ParamMap',
            'gnome.map.MapFromBNA'
        ],

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model, 'change:map', this.rerender);
            this.listenTo(webgnome.model, 'change:map', this.setupMapListener);
            this.setupMapListener();
        },

        setupMapListener: function(){
            this.listenTo(webgnome.model.get('map'), 'sync', this.rerender);
        },

        rerender: function() {
            this.render();
        },

        render: function(){
            var map = webgnome.model.get('map');

            if(map && map.get('obj_type') !== 'gnome.map.GnomeMap'){
                map.getGeoJSON(_.bind(function(geojson){
                    this.$el.html(_.template(MapPanelTemplate, {
                        map: true
                    }));

                    this.$('.panel').addClass('complete');
                    this.$('.panel-body').removeClass('text');
                    this.$('.panel-body').addClass('map').show();

                    var shorelineSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}),
                    });

                    //land style
                    var styles = [
                        new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: [228, 195, 140, 0.6]
                            }),
                            stroke: new ol.style.Stroke({
                                color: [228, 195, 140, 0.75],
                                width: 1
                            })
                        })
                    ];
                    if (geojson.features.length > 1) {
                        //lakes style
                        styles.push(
                        new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: [228, 195, 140, 0.6]
                            }),
                            stroke: new ol.style.Stroke({
                                color: [228, 195, 140, 0.75],
                                width: 1
                            })
                        })
                        );
                    }
                    var lakelayer = new ol.layer.Image({
                        name: 'lakes',
                        source: new ol.source.ImageVector({
                            source: shorelineSource,
                            style: styles
                        }),
                    });

                    var shorelineLayer = new ol.layer.Image({
                        name: 'modelmap',
                        source: new ol.source.ImageVector({
                            source: shorelineSource,
                            style: styles
                        }),
                    });
                    this.locationMap = new OlMapView({
                        el: this.$('#mini-locmap'),
                        controls: [],
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.TileWMS({
                                    url: 'http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
                                    params: {'LAYERS': '0', 'TILED': true}
                                }),
                                visible: webgnome.model.get('map').geographical
                            }),
                            shorelineLayer
                        ],
                        interactions: ol.interaction.defaults({
                            mouseWheelZoom: false,
                            dragPan: false,
                            doubleClickZoom: false
                        }),
                    });
                    
                    this.locationMap.render();
                    this.locationMap.map.on('postcompose', _.bind(function(){
                        var extent = shorelineSource.getExtent();
                        this.locationMap.map.getView().fit(extent, this.locationMap.map.getSize());
                    }, this));
                    this.trigger('render');
                }, this));
            } else {
                this.$el.html(_.template(MapPanelTemplate, {
                    map: false
                }));
                this.$('.panel').addClass('complete');
                this.$('.panel-body').addClass('text').show();
                this.$('.panel-body').removeClass('map');
            }
            BasePanel.prototype.render.call(this);
        },

        new: function(){
            var mapForm = new MapTypeForm();
            mapForm.on('hidden', mapForm.close);
            mapForm.on('waterWorld', _.bind(function(){
                    webgnome.model.set('map', new MapModel());
                    webgnome.model.save(null, {validate: false});
                }, this));
            mapForm.on('select', _.bind(function(form){
                mapForm.on('hidden', _.bind(function(){
                    form.on('hidden', form.close);
                    form.on('save', _.bind(function(map){
                        webgnome.model.set('map', map);
                        webgnome.model.save(null, {validate: false});
                    }, this));
                    form.render();
                }, this));
            }, this));
            mapForm.render();
        },

        load: function(){
            var map = webgnome.model.get('map');
            var form;
            if(map.get('obj_type') === 'gnome.map.ParamMap'){
                form = new ParamMapForm({map: map});
            } else {
                form = new FormModal({title: 'Edit Map', model: map});
            }

            form.render();
            form.on('hidden', form.close);
            form.on('save', map.resetRequest, map);
        },

        close: function(){
            if (this.locationMap) {
                this.locationMap.close();
            }
            BasePanel.prototype.close.call(this);
        }
    });

    return mapPanel;
});