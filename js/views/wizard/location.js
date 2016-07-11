define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'views/wizard/base',
    'model/gnome',
    'model/location',
    'model/environment/wind',
    'model/movers/wind',
    'model/outputters/trajectory',
    'model/environment/water',
    'views/form/text',
    'views/form/model',
    'views/form/wind',
    'views/form/custom',
    'views/modal/loading',
    'views/form/spill/type-wizcompat',
    'views/form/water'
], function($, _, Backbone, swal, BaseWizard, GnomeModel,
    GnomeLocation, GnomeWind, GnomeWindMover,
    TrajectoryOutputter, GnomeWater,
    TextForm, ModelForm, WindForm, CustomForm,
    LoadingModal, SpillTypeWizForm, WaterForm){
    'use strict';
    var locationWizardView = BaseWizard.extend({
        steps: [],
        initialize: function(opts){
            this.location = new GnomeLocation({id: opts.slug});
            this.name = opts.name;
            this.location.fetch({
                success: _.bind(this.found, this),
                error: _.bind(this.notfound, this)
            });
        },

        found: function(){
            webgnome.model.fetch({
                success: _.bind(this.load_location, this),
                error: _.bind(this.failed_load, this)
            });
        },

        failed_load: function(){
            console.log('Location model failed to load');
            swal({
                title: 'Failed to Load Location',
                text: 'Something went wrong while loading the location model.',
                type: 'error',
            });
        },

        helpNameConvert: function(text) {
            return text.split(",")[0].replace(/\s/g, "_");
        },

        load_location: function(){
            webgnome.model.set('uncertain', true);
            webgnome.model.save(null, {validate: false});

            // clear any previously loaded steps
            _.each(this.steps, function(el){
                el.close();
            });
            this.steps = [];

            // set up each step described in the location file.
            _.each(this.location.get('steps'), _.bind(function(el){
                var title = [];
                title[0] = el.title;
                title[1] = this.name;
                var helpFilename = this.helpNameConvert(this.name);
                if(el.type === 'text' || el.type === 'welcome'){
                    var textOpts = {
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    };
                    if (el.type === 'welcome') {
                        textOpts['moduleId'] = 'views/model/locations/' + helpFilename;
                    }
                    this.steps.push(new TextForm(textOpts));
                } else if (el.type === 'model') {
                    this.steps.push(new ModelForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }, webgnome.model));
                } else if (el.type === 'wind') {
                    if(!el.title){
                        title[0] = 'Wind';
                    }
                    var wind = new GnomeWind();
                    var windform = new WindForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancel</button><button type='button' class='back'>Back</button><button type='button' class='next'>Next</button>"
                    }, wind);
                    windform.on('save', _.bind(function(){
                        var windMover = new GnomeWindMover({wind: wind});
                        webgnome.model.get('movers').add(windMover, {merge: true});
                        webgnome.model.get('environment').add(wind, {merge: true});
                    }, this));

                    this.steps.push(windform);
                } else if (el.type ==='custom'){
                    var customForm = new CustomForm({
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons,
                        module: el.module,
                        functions: el.functions
                    });

                    this.steps.push(customForm);
                } else if (el.type === 'finish') {
                    if (!el.title){
                        title[0] = 'Finalize Model';
                    }
                    var finishForm = new TextForm({
                        name: el.name,
                        title: title.join(' '),
                        body: "<div>Filler Text</div>",
                        buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancel</button><button type='button' class='back'>Back</button><button type='button' class='finish' data-dismiss='modal'>Run Model</button>"
                    });
                    finishForm.on('finish', function(){
                        webgnome.model.save().always(function(){
                            localStorage.setItem('view', 'trajectory');
                            webgnome.router.navigate('trajectory', true);
                        });
                    });

                    this.steps.push(finishForm);
                }

            }, this));

            var stepLength = this.steps.length;
            var spillWizForm = new SpillTypeWizForm({
                name: 'step' + (stepLength - 2),
                title: 'Select Spill Type <span class="sub-title">GNOME Wizard</span>'
            }).on('select', _.bind(function(form){
                form.title += '<span class="sub-title">GNOME Wizard</span>';
                form.name = 'step' + (stepLength - 2);
                form.buttons = '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>';

                // dynamically add the water form to the wizard if the substance is weatherable
                form.on('save', _.bind(function(){
                    this.dynamicWaterListener(form.model.get('element_type').get('substance'));
                }, this));
                
                this.register(form);
                this.steps[this.step].on('hidden', _.bind(function(){
                    this.close();
                }, this.steps[this.step]));

                this.steps[this.step] = form;

                form.on('save', _.bind(function(){
                    webgnome.model.get('spills').add(form.model);
                }, this));
            }, this));

            this.steps.splice(stepLength - 1, 0, spillWizForm);

            this.start();
        },

        dynamicWaterListener: function(substance){
            var waterExists = this.steps[this.steps.length - 2].className.indexOf('water-form') > -1;
            if (!_.isNull(substance) && !waterExists){
                var waterForm = this.addWaterForm();
                this.steps.splice(this.steps.length - 1, 0, waterForm);
            }
        },

        addWaterForm: function() {
            var water = new GnomeWater();
            var waterForm = new WaterForm({
                    title: 'Water Properties <span class="sub-title">GNOME Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
                }, water).on('save', function(){
                    webgnome.model.get('environment').add(water);
            });
            waterForm.on('save', this.next, this);
            waterForm.on('back', this.prev, this);
            waterForm.on('wizardclose', this.close, this);
            waterForm.on('finish', this.close, this);

            return waterForm;
        },

        notfound: function(){
            console.log('location was not found');
            swal({
                title: 'Location Not Found',
                text: 'The requested location wasn\'t found on the server',
                type: 'error',
            });
        }
    });

    return locationWizardView;
});