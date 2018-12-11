define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'text!templates/panel/griddedwind.html',
    'views/form/griddedwind_edit',
    'views/panel/base',
    'views/form/griddedwind'
], function($, _, Backbone, swal,
            GriddedWindPanelTemplate, GridedWindEditForm, BasePanel, GriddedWindForm) {
    var griddedWindPanel = BasePanel.extend({
        className: 'col-md-3 griddedwind object panel-view',

        models: [
            'gnome.movers.py_wind_movers.PyWindMover'
        ],

        initialize: function(options) {
            BasePanel.prototype.initialize.call(this, options);

            this.listenTo(webgnome.model, 'change:duration chage:start_time',
                          this.rerender);
            this.listenTo(webgnome.model.get('movers'), 'add change remove',
                          this.rerender);
        },

        new: function() {
            var form = new GriddedWindForm();
            form.on('hidden', form.close);

            form.on('save', _.bind(function(mover) {
                webgnome.model.get('movers').add(mover);

                if (mover.attributes.obj_type === 'gnome.movers.py_wind_movers.PyWindMover') {
                    webgnome.model.get('environment').add(mover.get('wind'));
                }

                webgnome.model.save(null, {validate: false});
            }, this));

            form.render();
        },

        edit: function(e) {
            e.stopPropagation();
            var id = this.getID(e);

            var griddedwind = webgnome.model.get('movers').get(id);
            var title = 'Gridded Wind: ' + griddedwind.get('name');

            var griddedwindView = new GridedWindEditForm({title: title,
                                                          model: griddedwind});

            griddedwindView.on('save', function() {
                griddedwindView.on('hidden', griddedwindView.close);
            });

            griddedwindView.on('wizardclose', griddedwindView.close);

            griddedwindView.render();
        },

        render: function() {
            var griddedwind = webgnome.model.get('movers').filter(function(mover) {
                return (['gnome.movers.py_wind_movers.PyWindMover']
                        .indexOf(mover.get('obj_type')) !== -1);
            });

            var compiled = _.template(GriddedWindPanelTemplate, {
                griddedwind: griddedwind
            });

            this.$el.html(compiled);

            if (griddedwind.length > 0) {
                this.$('.griddedwind .panel').addClass('complete');
                this.$el.removeClass('col-md-3').addClass('col-md-6');
                this.$('.panel-body').show();
            }
            else {
                this.$el.removeClass('col-md-6').addClass('col-md-3');
                this.$('.panel-body').hide();
            }

            if (griddedwind.length > 0) {
                this.$('.panel-body').show();
            }
            else {
                this.current_extents = [];
                this.$('.panel-body').hide();
            }

            BasePanel.prototype.render.call(this);
        },

        addWindToPanel: function(geojson) {
/*
            if (geojson) {
                var gridSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()
                               .readFeatures(geojson,
                                             {featureProjection: 'EPSG:3857'})),
                });

                var extentSum = gridSource.getExtent()
                                .reduce(function(prev, cur) {
                                    return prev + cur;
                                });

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

                if (!_.contains(this.current_extents, extentSum)) {
                    this.current_layers.push(gridLayer);
                    this.current_extents.push(extentSum);
                }
            }
*/
        },

        delete: function(e) {
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
            }).then(_.bind(function(isConfirmed) {
                if (isConfirmed) {
                    var mov = webgnome.model.get('movers').get(id);
                    var envs = webgnome.model.get('environment');
                    if (mov.get('obj_type') === 'gnome.movers.py_wind_movers.PyWindMover') {
                        var env_id = mov.get('wind').get('id');

                        for (var i = 0; i < envs.length; i++) {
                            if (envs.models [i].get('id') === env_id) {
                                envs.remove(env_id);
                            }
                        }
                    }
                    webgnome.model.get('movers').remove(id);
                    webgnome.model.save(null, {
                        validate: false
                    });
                }
            }, this));
        },

        close: function() {
            if (this.currentMap) {
                this.currentMap.close();
            }

            BasePanel.prototype.close.call(this);
        }
    });

    return griddedWindPanel;
});
