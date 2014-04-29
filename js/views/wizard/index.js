define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'lib/ol',
    'views/wizard/modal',
    'lib/text!templates/wizard/step1.html',
    'lib/text!templates/wizard/step2.html',
    'lib/text!templates/wizard/step3.html',
    'lib/text!templates/wizard/step4.html',
    'models/gnome',
    'models/map',
    'lib/jquery.datetimepicker',
    'lib/jquery.fileupload'
], function($, _, Backbone, moment, ol, WizardModal,
            Step1Template, Step2Template, Step3Template, Step4Template,
            GnomeModel, GnomeMap){
    
    var wizardView = Backbone.View.extend({
        step_num: 1,

        initialize: function(){
            this.model = new GnomeModel();
            //this.location = new GnomeLocation();
            //this.spill = new GnomeSpill();
            this.step1();
        },

        step1: function(){
            // setup the model settings
            var step = new step1({
                body: _.template(Step1Template, {
                    start_time: moment.unix(this.model.get('start_time')).format('YYYY/M/D H:mm'),
                    duration: this.model.formatDuration(),
                    uncertainty: this.model.get('uncertain')
                })
            });

            
            step.on('next', function(){
                // save the form inforation into the model
                var start_time = moment(step.$('#start_time').val(), 'YYYY/M/D H:mm').unix();
                this.model.set('start_time', start_time);

                var days = step.$('#days').val();
                var hours = step.$('#hours').val();
                var duration = (((days * 24) + parseInt(hours, 10)) * 60) * 60;
                this.model.set('duration', duration);

                var uncertainty = step.$('#uncertainty:checked').val();
                this.model.set('uncertain', _.isUndefined(uncertainty) ? false : true);

                this.step2();
            }, this);

            step.on('wizardclose', function(){
                this.close();
            }, this);
        },

        step2: function(){
            // setup the location for the model
            var step = new step2({
                body: _.template(Step2Template, {

                })
            });

            step.on('back', function(){
                this.step1();
            }, this);

            step.on('next', function(){
                this.step3();
            }, this);

            step.on('wizardclose', function(){
                this.close();
            }, this);
        },

        step3: function(){
            // setup the spill and attributes
            var step = new step3({
                body: _.template(Step3Template, {

                })
            });

            

            step.on('back', function(){
                this.step2();
            }, this);

            step.on('next', function(){
                this.step4();
            }, this);

            step.on('wizardclose', function(){
                this.close();
            }, this);
        },

        step4: function(){
            // setup environment variables/objects
            var step = new step4({
                body: _.template(Step4Template, {

                })
            });

            step.on('back', function(){
                this.step3();
            }, this);

            step.on('wizardclose', function(){
                this.close();
            }, this);
        },

        close: function(){
            //this.spill.close();
            //this.location.close();
            this.model.close();

            $('.xdsoft_datetimepicker').remove();

            this.unbind();
            this.remove();
        }

    });

    var step1 = WizardModal.extend({
        name: 'step1',
        title: 'Model Settings <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="next">Next</button>',
        
        initialize: function(options){
            WizardModal.prototype.initialize.call(this, options);

            this.$('#start_time').datetimepicker({
                format: 'Y/n/j G:i'
            });
        },

        validate: function(){
            var start_time = this.$('#start_time').val();
            var days = this.$('#days').val();
            var hours = this.$('#hours').val();

            if (!moment(start_time, 'YYYY/M/D H:mm').isValid()) {
                return 'Start time must be a valid datetime string (YYYY/M/D H:mm)';
            }

            if(days != parseInt(days, 10) || hours != parseInt(hours, 10)){
                return 'Duration values should be numbers only.';
            }

            if(parseInt(days, 10) === 0 && parseInt(hours, 10) === 0){
                return 'Duration length should be greater than zero.';
            }
        },

        next: function(){
            WizardModal.prototype.next.call(this);
            $('.xdsoft_datetimepicker').remove();
        }
    });

    var step2 = WizardModal.extend({
        name: 'step2',
        title: 'Map <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
        model: new GnomeMap(),

        // @todo move gnomemap references to parent view.

        events: function() {
            return _.defaults({
                'fileuploadadd .file': 'add',
                'fileuploadfail .file': 'fail'
            }, WizardModal.prototype.events);
        },

        initialize: function(options) {
            WizardModal.prototype.initialize.call(this, options);
            var dropZone = $('.file');

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

            this.$('.file').fileupload({
                url: webgnome.api + '/upload',
                dropZone: this.$('.file'),
                add: null
            });
        },

        add: function(e, data) {
            // make sure the user only added one file.
            if (data.originalFiles.length > 1){
                this.error('Error!', 'Only a single file source for the map is supported.');
                return false;
            }

            if(!data.files[0].name.match(/(\.|\/)(bna|json|geojson)$/i)) {
                this.error('Invalid file type!', 'Only <code>.bna</code>, <code>.json</code>, and <code>.geojson</code> file types are supported.');
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
        },

        tab_ready: function(event) {
            if (event.target.hash == '#coast'){
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
            } else if (event.target.hash == '#draw') {
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

        validate: function(){
            if(!this.model.isValid()){
                return this.model.validationError;
            }
        },

        close: function() {
            WizardModal.prototype.close.call(this);
            this.draw_map = null;
            this.coast_map = null;
            this.source = null;
            this.$('#file').fileupload('destroy');
            $(document).unbind('drop dragover');
            $('input[type="file"]').remove();
        }

    });

    var step3 = WizardModal.extend({
        name: 'step3',
        title: 'Spill <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
    });

    var step4 = WizardModal.extend({
        name: 'step4',
        title: 'Environment <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="finish">Build</button>',
    });

    return wizardView;
});