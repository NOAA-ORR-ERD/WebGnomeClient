define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'ol',
    'views/default/map',
    'views/panel/base',
    'views/form/griddedwind',
    'text!templates/panel/griddedwind.html',
    'views/modal/form'
], function($, _, Backbone, swal, ol, OlMapView, BasePanel, GriddedWindForm, GriddedWindPanelTemplate, FormModal){
    var griddedWindPanel = BasePanel.extend({
        className: 'col-md-3 griddedwind object panel-view',

        models: [
            'gnome.movers.py_wind_movers.PyWindMover'
        ],

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model, 'change:duration chage:start_time', this.rerender);
            this.listenTo(webgnome.model.get('movers'), 'add change remove', this.rerender);
        },

        new: function(){
            var form = new GriddedWindForm();
            form.on('hidden', form.close);
            form.on('save', _.bind(function(mover){
                webgnome.model.get('movers').add(mover);
                if (mover.attributes.obj_type === 'gnome.movers.py_wind_movers.PyWindMover') {
                    webgnome.model.get('environment').add(mover.get('wind'));
                }
                webgnome.model.save(null, {validate: false});
            }, this));
            form.render();
        },

        edit: function(e){
            e.stopPropagation();
            var id = this.getID(e);

            var griddedwind = webgnome.model.get('movers').get(id);
            var griddedwindView = new FormModal({title: 'Edit Wind', model: griddedwind});
            griddedwindView.on('save', function(){
                griddedwindView.on('hidden', griddedwindView.close);
            });
            griddedwindView.on('wizardclose', griddedwindView.close);
            griddedwindView.render();
        },

        render: function(){
            var griddedwind = webgnome.model.get('movers').filter(function(mover){
                return [
                    'gnome.movers.py_wind_movers.PyWindMover'
                ].indexOf(mover.get('obj_type')) !== -1;
            });
            var compiled = _.template(GriddedWindPanelTemplate, {
                griddedwind: griddedwind
            });
            this.$el.html(compiled);

            if (griddedwind.length > 0) {
                this.$('.griddedwind .panel').addClass('complete');
                this.$el.removeClass('col-md-3').addClass('col-md-6');
                this.$('.panel-body').show();
            } else {
                this.$el.removeClass('col-md-6').addClass('col-md-3');
                this.$('.panel-body').hide();
            }
            if(griddedwind.length > 0){
                this.$('.panel-body').show();
                this.current_layers = new ol.Collection([
                    new ol.layer.Tile({
                        source: new ol.source.TileWMS({
                                url: 'http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
                                params: {'LAYERS': '0', 'TILED': true}
                            })
                    })
                ]);


            } else {
                this.current_extents = [];
                this.$('.panel-body').hide();
            }
            BasePanel.prototype.render.call(this);
        },

        addWindToPanel: function(geojson){
            if(geojson){
                var gridSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}),
                });
                var extentSum = gridSource.getExtent().reduce(function(prev, cur){ return prev + cur;});

                var gridLayer = new ol.layer.Image({
                    name: 'modelwind',
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
                text: 'Are you sure you want to delete this wind?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(isConfirmed){
                if(isConfirmed){
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
    return griddedWindPanel;
});