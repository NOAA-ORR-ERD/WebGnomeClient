define([
    'underscore',
    'jquery',
    'backbone',
    'views/modal/form',
    'lib/text!templates/form/map.html'
], function(_, $, Backbone, FormModal, FormTemplate){
    var mapForm = FormModal.extend({
        name: 'step2',
        title: 'Map <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',

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

            this.body = _.template(FormTemplate);

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

            this.render();

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
                        target: 'map',
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
                        target: 'draw-map',
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
                $(event.target).siblings('input')[0].checked = true;
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
            this.trigger('success', data.files[0]);
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
    