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

        load_location: function(){
            // clear any previously loaded steps
            _.each(this.steps, function(el){
                el.close();
            });
            this.steps = [];

            // set up each step described in the location file.
            _.each(this.location.get('steps'), _.bind(function(el){
                var title = [];
                title[0] = el.title;
                title[1] = '<span class="sub-title">' + this.name + '</span>';
                if(el.type === 'text' || el.type === 'welcome'){
                    if(!el.title){
                        title[0] = 'Welcome';
                    }
                    this.steps.push(new TextForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }));
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
                        webgnome.model.get('environment').add(wind, {merge: true});
                    }, this));

                    this.steps.push(windform);
                } else if (el.type ==='custom'){
                    var customForm = new CustomForm({
                        title: el.title,
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
                        buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancel</button><button type='button' class='back'>Back</button><button type='button' class='finish' data-dismiss='modal'>Finalize Model</button>"
                    });
                    finishForm.on('finish', function(){
                        webgnome.model.save().always(function(){
                            localStorage.setItem('view', 'trajectory');
                            webgnome.router.navigate('model', true);
                        });
                        finishForm.trigger('wizardclose');
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
                    this.register(form);
                    this.steps[this.step].on('hidden', _.bind(function(){
                        this.close();
                    }, this.steps[this.step]));
                    this.steps[this.step] = form;
                    form.on('save', _.bind(function(){
                        webgnome.model.get('spills').add(form.model);
                        var substance = webgnome.model.get('spills').at(0).get('element_type').get('substance');
                        if (!_.isNull(substance)){
                            var waterForm = this.addWaterForm();
                            this.steps.splice(stepLength - 1, 0, waterForm);
                        }
                    }, this));
                }, this));

            this.steps.splice(stepLength - 2, 0, spillWizForm);

            this.start();
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