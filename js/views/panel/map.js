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

        render: function(){
            var map = webgnome.model.get('map');

            if(map && map.get('obj_type') !== 'gnome.map.GnomeMap'){
                this.$el.html(_.template(MapPanelTemplate, {
                    map: true
                }));

                this.$('.panel').addClass('complete');
                map.getGeoJSON(_.bind(function(geojson){
                    this.$('.panel-body').removeClass('text');
                    this.$('.panel-body').addClass('map').show();

                    var shorelineSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}),
                    });

                    var shorelineLayer = new ol.layer.Image({
                        name: 'modelmap',
                        source: new ol.source.ImageVector({
                            source: shorelineSource,
                            style: new ol.style.Style({
                                fill: new ol.style.Fill({
                                    color: [228, 195, 140, 0.6]
                                }),
                                stroke: new ol.style.Stroke({
                                    color: [228, 195, 140, 0.75],
                                    width: 1
                                })
                            })
                        }),
                    });
                    
                    var locationMap = new OlMapView({
                        id: 'mini-locmap',
                        controls: [],
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.MapQuest({layer: 'osm'}),
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
                    
                    locationMap.render();
                    var extent = shorelineSource.getExtent();
                    locationMap.map.getView().fit(extent, locationMap.map.getSize());
                }, this));
            } else {
                this.$el.html(_.template(MapPanelTemplate, {
                    map: false
                }));
                this.$('.panel').addClass('complete');
                this.$('.panel-body').addClass('text').show().html();
                this.$('.panel-body').removeClass('map');
            }
        },

        new: function(){
            var mapForm = new MapTypeForm();
            mapForm.on('hidden', mapForm.close);
            mapForm.on('waterWorld', _.bind(function(){
                webgnome.model.save({map: new MapModel()}, {
                    validate: false,
                    success: _.bind(function(){
                        this.render();
                        mapForm.hide();
                    }, this)
                });
            }, this));
            mapForm.on('select', _.bind(function(form){
                mapForm.on('hidden', _.bind(function(){
                    form.render();
                    form.on('hidden', form.close);
                    form.on('save', _.bind(function(map){
                        webgnome.model.set('map', map);
                        webgnome.model.save(null, {validate: false});
                        this.render();
                    }, this));
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
            form.on('save', this.render, this);
        }
    });

    return mapPanel;
});