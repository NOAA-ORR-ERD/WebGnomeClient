define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'ol',
    'views/modal/form',
    'views/default/map',
    'text!templates/form/spill-map.html',
    'text!templates/form/spill-form.html',
], function($, _, Backbone, moment, ol, FormModal, olMapView, MapTemplate, SpillTemplate) {
    var spillForm = FormModal.extend({
        className: 'modal fade form-modal spill-form',
        name: 'spill',
        title: 'Spill',
        interaction: null,

        events: function(){
            return _.defaults({
                'click .point': 'newPoint',
                'click .line': 'newLine',
            }, FormModal.prototype.events);
        },
        
        initialize: function(options, GnomeSpills, GnomeMap) {
            FormModal.prototype.initialize.call(this, options);

            this.body = _.template(MapTemplate);
            this.GnomeSpills = GnomeSpills;
            this.GnomeMap = GnomeMap;
            this.source = new ol.source.Vector();

            this.GnomeSpills.forEach(_.bind(function(spill){
                if (_.difference(spill.get('release').get('start_position'), spill.get('release').get('end_position')).length === 0) {
                    var coords = ol.proj.transform(spill.get('release').get('start_position'), 'EPSG:4326', 'EPSG:3857');
                    var feature = new ol.Feature(new ol.geom.Point(coords));
                    feature.set('cid', spill.cid);
                    this.source.addFeature(feature);
                } else {
                    var start_coords = ol.proj.transform(spill.get('release').get('start_position'), 'EPSG:4326', 'EPSG:3857');
                    var end_coords = ol.proj.transform(spill.get('release').get('end_position'), 'EPSG:4326', 'EPSG:3857');
                    var feature = new ol.Feature(new ol.geom.LineString([start_coords, end_coords]));
                    feature.set('cid', spill.cid);
                    this.source.addFeature(feature);
                }
            }, this));


            this.vector = new ol.layer.Vector({
                source: this.source,
                name: 'spills'
            });
            
            this.select = new ol.interaction.Select({
                layers:[
                    this.vector
                ],
                style: [new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        fill: null,
                        stroke: new ol.style.Stroke({color: 'orange', width: 2})
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'orange',
                        width: 2
                    })
                })]
            });

            this.select.getFeatures().on('add', function(event){
                var feature = event.element;
                this.loadSpill(feature);
            }, this);

            this.select.getFeatures().on('remove', function(event){
                this.unloadSpill();
            }, this);

            this.modify = new ol.interaction.Modify({
                features: this.select.getFeatures()
            });

            this.newPointDraw = new ol.interaction.Draw({
                source: this.source,
                type: /** @type {ol.geom.GeometryType} */ ('Point')
            });
            this.newLineDraw = new ol.interaction.Draw({
                source: this.source,
                type: /** @type {ol.geom.GeometryType} */ ('LineString')
            });

            if(this.GnomeMap.get('filename') == 'EmptyMap.bna'){
                this.ol = new olMapView({
                    interactions: ol.interaction.defaults().extend([
                        this.select
                    ]),
                    layers: [
                        this.vector
                    ]
                });
            }

            this.render();
        },

        ready: function() {
            this.ol.render();

            // hover listener for map
            this.$(this.ol.map.getViewport()).on('mousemove', _.bind(function(event){
                var pixel = this.ol.map.getEventPixel(event.originalEvent);
                var feature = this.ol.map.forEachFeatureAtPixel(pixel, function(feature, layer){
                    return feature;
                });

                if (feature) {
                    this.ol.map.getViewport().style.cursor = 'pointer';
                } else {
                    this.ol.map.getViewport().style.cursor = '';
                }
            }, this));
        },

        newPoint: function() {
            this.ol.map.removeInteraction(this.interaction);
            this.interaction = this.newPointDraw;
            this.ol.map.addInteraction(this.interaction);
            this.interaction.on('drawend', this.drawEnd, this);
        },

        newLine: function() {
            this.ol.map.removeInteraction(this.interaction);
            this.interaction = this.newLineDraw;
            this.ol.map.addInteraction(this.interaction);
            this.interaction.on('drawend', this.drawEnd, this);
        },

        drawEnd: function(event) {
            this.ol.map.removeInteraction(this.interaction);
            this.interaction = null;
            var feature = event.feature;

            // double check that a feature is selected if not load it
            setTimeout(_.bind(function(){
                if (this.select.getFeatures().getLength() === 0){
                    this.select.getFeatures().push(feature);
                }
            }, this), 400);

            // create a new spill model in the spills collection and add the cid
            // to the feature
            var spill = this.GnomeSpills.add({'on': true});
            spill.get('release').set({
                start_position: ol.proj.transform(feature.getGeometry().getFirstCoordinate(), 'EPSG:3857', 'EPSG:4326'),
                end_position: ol.proj.transform(feature.getGeometry().getLastCoordinate(), 'EPSG:3857', 'EPSG:4326')
            });
            spill.set('name', 'New Spill ' + spill.cid);
            feature.set('cid', spill.cid);
        },

        loadSpill: function(feature){
            if (this.$('.spill-form').length === 0){
                var spill = this.GnomeSpills.get(feature.get('cid'));
                this.$('.map').css('height', '200px');
                this.ol.map.updateSize();
                this.$('.modal-body').append(_.template(SpillTemplate, {
                    start_lat: spill.get('release').get('start_position')[1],
                    start_lng: spill.get('release').get('start_position')[0],
                    end_lat: spill.get('release').get('end_position')[1],
                    end_lng: spill.get('release').get('end_position')[0],
                    name: spill.get('name'),
                    release_amount: spill.get('release-amount'),
                    release_start: _.isNull(spill.get('release').get('release_time')) ? moment().format('YYYY/M/D H:mm') : moment.unix(spill.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                    release_end: _.isNull(spill.get('release').get('end_release_time')) ? moment().format('YYYY/M/D H:mm') : moment.unix(spill.get('release').get('end_release_time')).format('YYYY/M/D H:mm')
                }));
                this.$('#release-start').datetimepicker({
                    format: 'Y/n/j G:i',
                });
                this.$('#release-end').datetimepicker({
                    format: 'Y/n/j G:i',
                });

                // the feature is a point geometry hide the end position inputs 
                if (feature.getGeometry().getType() === 'Point') {
                    this.$('.end-position').hide();
                }

                this.ol.map.getView().setCenter(feature.getGeometry().getFirstCoordinate());

                // set the correct select input on the forms
                if(!_.isUndefined(spill.get('pollutant'))){
                    this.$('#pollutant').find('option[value="' + spill.get('pollutant') + '"]').attr('selected', 'selected');
                }
                if(!_.isUndefined(spill.get('release-unit'))){
                    this.$('#release-unit').find('option[value="' + spill.get('release-unit') + '"]').attr('selected', 'selected');
                }

                // setup a drag listener that will keep the selected point updated
                // if the user moves it on the map
                // for when using the modify control on the map, currently not supported.
                // this.dragkey = this.ol.map.on('pointerdrag', _.bind(this.mapUpdateSpill, this));

                this.$('.remove').on('click', _.bind(function(e){
                    e.preventDefault();
                    this.removeSpill();
                }, this));
            }
        },

        unloadSpill: function(){
            this.$('.map').css('height', '');
            this.ol.map.updateSize();
            this.$('.spill-form').remove();
            $('.xdsoft_datetimepicker').remove();
            //this.ol.map.unByKey(this.dragkey);
        },

        update: function(){
            // when information on the form is updated update the spill object
            // and the map feature.
            var feature = this.select.getFeatures().getArray()[0];
            if(feature){
                var spill = this.GnomeSpills.get(feature.get('cid'));

                spill.set('name', this.$('#name').val());

                // if this is a point update the end position to be the same as the start position
                if(feature.getGeometry().getType() === 'Point'){
                    spill.get('release').set('start_position', [parseFloat(this.$('#start-lng').val()), parseFloat(this.$('#start-lat').val())]);
                    spill.get('release').set('end_position', [parseFloat(this.$('#start-lng').val()), parseFloat(this.$('#start-lat').val())]);
                    this.$('#end-lng').val(spill.get('release').get('start_position')[0]);
                    this.$('#end-lat').val(spill.get('release').get('start_position')[1]);
                } else {
                    spill.get('release').set('start_position', [parseFloat(this.$('#start-lng').val()), parseFloat(this.$('#start-lat').val())]);
                    spill.get('release').set('end_position', [parseFloat(this.$('#end-lng').val()), parseFloat(this.$('#end-lat').val())]);
                }
                
                spill.set('pollutant', this.$('#pollutant').val());
                spill.set('release-amount', this.$('#release-amount').val());
                spill.set('release-unit', this.$('#release-unit').val());
                spill.get('release').set('release_time', moment(this.$('#release-start').val(), 'YYYY/M/D H:mm').unix());
                spill.get('release').set('end_release_time', moment(this.$('#release-end').val(), 'YYYY/M/D H:mm').unix());

                // update the features lat lng on the map to match the one in the map
                var start_coords = ol.proj.transform(spill.get('release').get('start_position'), 'EPSG:4326', 'EPSG:3857');
                var end_coords = ol.proj.transform(spill.get('release').get('end_position'), 'EPSG:4326', 'EPSG:3857');

                this.ol.map.getView().setCenter(start_coords);

                if(feature.getGeometry().getType() === 'Point'){
                    feature.getGeometry().setCoordinates(start_coords);
                } else {
                    var line = feature.getGeometry().getCoordinates();
                    line[0] = start_coords;
                    line[1] = end_coords;
                    feature.getGeometry().setCoordinates(line);
                }

                if(spill.isValid()){
                    this.error('Error!', spill.validationError);
                } else {
                    this.clearError();
                }
            }
        },

        mapUpdateSpill: function(event) {
            // update the lat lon values of the spill object and form when the user
            // modifies it on the map
            var feature = this.select.getFeatures().getArray()[0];
            var spill = this.GnomeSpills.get(feature.get('cid'));
            var start_position = ol.proj.transform(feature.getGeometry().getFirstCoordinate(), 'EPSG:3857', 'EPSG:4326');
            var end_point = ol.proj.transform(feature.getGeometry().getLastCoordinate(), 'EPSG:3857', 'EPSG:4326');

            spill.get('release').set('start_position', start_position);
            spill.set('end_point', end_point);

            this.$('#lng').val(spill.get('release').get('start_position')[0]);
            this.$('#lat').val(spill.get('release').get('start_position')[1]);
        },

        removeSpill: function(){
            var feature = this.select.getFeatures().getArray()[0];
            var spill = this.GnomeSpills.get(feature.get('cid'));
            this.GnomeSpills.remove(spill);
            this.select.getFeatures().clear();
            this.source.removeFeature(feature);
        },

        remove: function(){
            this.ol.remove();
            FormModal.prototype.remove.call(this);
        }
    });

    return spillForm;
});