define([
    'underscore',
    'jquery',
    'backbone',
    'views/modal/form',
    'text!templates/form/map.html'
], function(_, $, Backbone, FormModal, FormTemplate){
    var mapForm = FormModal.extend({
        className: 'modal fade form-modal map-form',
        name: 'map',
        title: 'Map',

        events: function() {
            return _.defaults({
                'fileuploadadd .file': 'add',
                'fileuploadfail .file': 'fail',
                'shown.bs.tab': 'tab_ready',
                'shown.bs.collapse': 'tab_ready',
                'click .panel-title a': 'select'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            var dropZone = $('.file');
            
            this.model = model;

            $(document).bind('drop', function(e) {
                dropZone.removeClass('hover');
                e.preventDefault();
            }).bind('dragover', function(e) {
                var found = false,
                    node = e.target;
                do {
                    if (node === dropZone[0]) {
                        found = true;
                        break;
                    }
                    node = node.parentNode;
                } while (node !== null);

                if (found) {
                    dropZone.addClass('hover');
                } else {
                    dropZone.removeClass('hover');
                }

                e.preventDefault();
            }).bind('dragend', function(e) {
                $('.file').removeClass('hover');
            });
        },

        render: function(options){
            this.body = _.template(FormTemplate);

            FormModal.prototype.render.call(this, options);

            if(['EmptyMap.bna', 'coast', 'draw'].indexOf(this.model.get('filename')) == -1){
                this.$('.upload').val(this.model.get('filename'));
            }

            this.$('input[value="' + this.model.get('filename') + '"]')[0].checked = true;
            this.$('input[value="' + this.model.get('filename') + '"]').parents('.panel').find('.collapse').addClass('in');

            this.$('.file').fileupload({
                url: webgnome.api + '/upload',
                dropZone: this.$('.file'),
                add: null,
            });
        },

        tab_ready: function(event){
            if (event.target.hash == '#coast' || event.target.id == 'coast'){
                if(_.isUndefined(this.coast_map)){
                    this.coast_map = new ol.Map({
                        target: 'map-form-coast-map',
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.MapQuest({layer: 'osm'})
                            })
                        ],
                        view: new ol.View2D({
                            center: ol.proj.transform([-99.6, 40.6], 'EPSG:4326', 'EPSG:3857'),
                            zoom: 3
                        })
                    });
                }
            } else if (event.target.hash == '#draw' || event.target.id == 'draw') {
                if (_.isUndefined(this.draw_map)){
                    this.source = new ol.source.Vector();
                    this.draw_map = new ol.Map({
                        target: 'map-form-draw-map',
                        renderer: 'canvas',
                        views: new ol.View2D({
                            center: [0, 0],
                            zoom: 1
                        }),
                        interactions: [
                            new ol.interaction.Draw({
                                type: /** @type {ol.geom.GeometryType} */ ('MultiPolygon'),
                                source: this.source
                            })
                        ],
                        layers: [
                            new ol.layer.Vector({
                                source: new ol.source.GeoJSON({
                                    object: {
                                        'type': 'FeatureColection',
                                        'crs': {
                                            'type': 'name',
                                            'properties': {
                                                'name': 'EPSG:4326'
                                            }
                                        },
                                        'features': [
                                            {
                                                'type': 'Feature',
                                                'geometry': {
                                                    'type': 'Point',
                                                    'coordinates': [0, 0]
                                                }
                                            }
                                        ]
                                    }
                                })
                            })
                        ],
                        controls: [
                            new ol.control.ScaleLine()
                        ]
                    });
                }
            }
        },

        select: function(event){
            if (event.target.hash !== ''){
                this.$(event.target).siblings('input')[0].checked = true;
                if(this.$(event.target).siblings('input').val()){
                    this.model.set('filename', this.$(event.target).siblings('input').val());
                } else {
                    this.model.set('filename', 'EmptyMap.bna');
                }
            }
        },

        add: function(e, data) {
            // make sure the user only added one file.
            if (data.originalFiles.length > 1){
                this.error('Error!', 'Only a single file source for the map is supported.');
                return false;
            }

            if(!data.files[0].name.match(/(\.|\/)(bna|json|geojson)$/i)) {
                this.error('Invalid file type!', 'Only <code>.bna</code>, <code>.json</code>, and <code>.geojson</code> files are supported.');
                return false;
            }

            this.$('.file').addClass('hide');
            this.$('.loading').addClass('show');
            data.submit();
        },

        fail: function(e, data){
            this.$('.file').removeClass('hide');
            this.$('.loading').removeClass('show');
            this.error('Upload Failed!', 'The API server could not be reached.');
        },

        success: function(e, data){
            this.model.set('filename', data.files[0]);
            this.$('input[type="radio"]:checked').val(this.model.get('filename'));
        },

        close: function() {
            FormModal.prototype.close.call(this);
            this.draw_map = null;
            this.coast_map = null;
            this.source = null;
            this.$('#file').fileupload('destroy');
            $(document).unbind('drop dragover');
            $('input[type="file"]').remove();
        }
    });

    return mapForm;
});
    