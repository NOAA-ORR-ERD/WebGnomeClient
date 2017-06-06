define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'ol',
    'views/default/map',
    'views/panel/base',
    'views/form/mover/create',
    'views/form/mover/edit',
    'text!templates/panel/current.html',
    'views/modal/form'
], function($, _, Backbone, swal, ol, OlMapView, BasePanel, CreateMoverForm, EditMoverForm, CurrentPanelTemplate, FormModal){
    var currentPanel = BasePanel.extend({
        className: 'col-md-3 current object panel-view',

        models: [
            'gnome.movers.current_movers.CatsMover',
            'gnome.movers.current_movers.GridCurrentMover',
            'gnome.movers.py_current_movers.PyCurrentMover'
        ],

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('movers'), 'add change remove', this.rerender);
        },

        new: function(){
            var form = new CreateMoverForm();
            form.on('hidden', form.close);
            form.on('save', _.bind(function(mover){
                webgnome.model.get('movers').add(mover);
                if (mover['attributes']['obj_type'] === 'gnome.movers.py_current_movers.PyCurrentMover') {
                    webgnome.model.get('environment').add(mover.get('current'));
                }
                webgnome.model.save(null, {validate: false});
            }, this));
            form.render();
        },
        
        edit: function(e){
            e.stopPropagation();
            var id = this.getID(e);

            var currentMover = webgnome.model.get('movers').get(id);
            var currentForm = new EditMoverForm(null, currentMover);
            currentForm.on('save', function(){
                currentForm.on('hidden', currentForm.close);
            });
            currentForm.on('wizardclose', currentForm.close);
            currentForm.render();
        },

        //keeping this for now in case i really break something!
        edit_old: function(e){
            e.stopPropagation();
            var id = this.getID(e);

            var current = webgnome.model.get('movers').get(id);
            var currentView = new FormModal({title: 'Edit Current', model: current});
            currentView.on('save', function(){
                currentView.on('hidden', currentView.close);
            });
            currentView.on('wizardclose', currentView.close);
            currentView.render();
        },

        render: function(){
            var currents = webgnome.model.get('movers').filter(function(mover){
                return [
                    'gnome.movers.current_movers.CatsMover',
                    'gnome.movers.current_movers.GridCurrentMover',
                    'gnome.movers.py_current_movers.PyCurrentMover'
                ].indexOf(mover.get('obj_type')) !== -1;
            });
            var compiled = _.template(CurrentPanelTemplate, {
                currents: currents
            });
            this.$el.html(compiled);

            if(currents.length > 0){
                this.$('.panel-body').show();
                this.current_layers = new ol.Collection([
                    new ol.layer.Tile({
                        source: new ol.source.TileWMS({
                                url: 'http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
                                params: {'LAYERS': '0', 'TILED': true}
                            })
                    })
                ]);

                this.currentMap = new OlMapView({
                    el: this.$('#mini-currentmap'),
                    controls: [],
                    layers: this.current_layers,
                    interactions: ol.interaction.defaults({
                        mouseWheelZoom: false,
                        dragPan: false,
                        doubleClickZoom: false
                    }),
                });
                this.currentMap.render();
                this.current_extents = [];
                for(var c = 0; c < currents.length; c++){
                    // currents[c].getGrid(_.bind(this.addCurrentToPanel, this));
                }

                this.currentMap.map.on('postcompose', _.bind(function(){
                    if(webgnome.model.get('map')){
                        if(webgnome.model.get('map').get('obj_type') !== 'gnome.map.GnomeMap'){
                            var extent = ol.extent.applyTransform(webgnome.model.get('map').getExtent(), ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
                            this.currentMap.map.getView().fit(extent, this.currentMap.map.getSize());
                        } else {
                            this.currentMap.map.getView().setZoom(3);
                        }
                    }
                }, this));

            } else {
                this.current_extents = [];
                this.$('.panel-body').hide();
            }
            BasePanel.prototype.render.call(this);
        },

        addCurrentToPanel: function(geojson){
            if(geojson){
                var gridSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}),
                });
                var extentSum = gridSource.getExtent().reduce(function(prev, cur){ return prev + cur;});

                var gridLayer = new ol.layer.Image({
                    name: 'modelcurrent',
                    source: new ol.source.ImageVector({
                        source: gridSource,
                        style: new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: [171, 37, 184, 0.75],
                                width: 1
                            })
                        })
                    })
                });

                if(!_.contains(this.current_extents, extentSum)){
                    this.current_layers.push(gridLayer);
                    this.current_extents.push(extentSum);
                }
            }
        },

        delete: function(e){
            e.stopPropagation();
            var id = this.getID(e);
            var spill = webgnome.model.get('movers').get(id);
            swal({
                title: 'Delete "' + spill.get('name') + '"',
                text: 'Are you sure you want to delete this current?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(isConfirmed){
                if(isConfirmed){
                    var mov = webgnome.model.get('movers').get(id);
                    var envs = webgnome.model.get('environment');
                    if (mov.get('obj_type') === 'gnome.movers.py_current_movers.PyCurrentMover') {
                        var env_id = mov.get('current').id;
                        for (var i = 0; i < envs.length; i++)
                            if (envs.models[i].id === env_id){
                                envs.remove(i);
                            }
                    }
                    webgnome.model.get('movers').remove(id);
                    webgnome.model.save(null, {
                        validate: false
                    });
                }
            }, this));
        },

        close: function(){
            if(this.currentMap){
                this.currentMap.close();
            }
            BasePanel.prototype.close.call(this);
        }

    });
    return currentPanel;
});