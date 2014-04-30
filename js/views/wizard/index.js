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
            this.map = new GnomeMap();
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
                    uncertainty: this.model.get('uncertain'),
                    time_steps: this.model.get('time_step') / 60
                })
            }, this.model);

            
            step.on('next', function(){
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
            }, this.map);

            step.on('success', function(file){
                this.map.set('filename', file.name);
            });

            step.on('back', function(){
                this.step1();
            }, this);

            step.on('next', function(event){
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
        
        initialize: function(options, model){
            WizardModal.prototype.initialize.call(this, options);

            this.model = model;

            this.$('#start_time').datetimepicker({
                format: 'Y/n/j G:i'
            });
        },

        update: function() {
            var start_time = moment(this.$('#start_time').val(), 'YYYY/M/D H:mm').unix();
            this.model.set('start_time', start_time);

            var days = this.$('#days').val();
            var hours = this.$('#hours').val();
            var duration = (((days * 24) + parseInt(hours, 10)) * 60) * 60;
            this.model.set('duration', duration);

            var uncertainty = this.$('#uncertainty:checked').val();
            this.model.set('uncertain', _.isUndefined(uncertainty) ? false : true);

            var time_steps = this.$('#time_steps').val() * 60;
            this.model.set('time_step', time_steps);

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
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

        // @todo move gnomemap references to parent view.

        events: function() {
            return _.defaults({
                'fileuploadadd .file': 'add',
                'fileuploadfail .file': 'fail',
                'shown.bs.tab': 'tab_ready',
                'shown.bs.collapse': 'tab_ready',
                'click .panel-title a': 'select'
            }, WizardModal.prototype.events);
        },

        initialize: function(options, model) {
            WizardModal.prototype.initialize.call(this, options);
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
            this.trigger('success', data.files[0]);
        },

        close: function() {
            WizardModal.prototype.close.call(this);
            this.draw_map = null;
            this.coast_map = null;
            this.source = null;
            this.$('#file').fileupload('destroy');
            $(document).unbind('drop dragover');
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