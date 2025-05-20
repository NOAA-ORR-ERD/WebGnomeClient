define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/base',
    'views/form/model',
    'views/form/water',
    'views/form/mover/wind',
    'views/form/spill/type',
    'views/form/text',
    'model/gnome',
    'model/environment/wind',
    'model/environment/water',
], function($, _, Backbone, BaseWizard,
        ModelForm, WaterForm, WindForm, SpillTypeForm, TextForm,
        GnomeModel, GnomeWind, GnomeWater){
    'use strict';
    var adiosWizard = BaseWizard.extend({
        initialize: function(){
            webgnome.model = new GnomeModel({
                name: 'ADIOS Model',
                duration: 432000
            });
            webgnome.model.save(null, {
                validate: false,
                error: this.fail,
                success: _.bind(this.setup, this)
            });
        },

        setup: function(){
            var wind = new GnomeWind();
            var water = new GnomeWater();

            this.steps = [
                new ModelForm({
                    name: 'step1',
                    title: 'Model Settings <span class="sub-title">ADIOS Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="next">Next</button>',
                }, webgnome.model),
                new WaterForm({
                    name: 'step2',
                    title: 'Water Properties <span class="sub-title">ADIOS Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
                }, water).on('save', function(){
                    webgnome.model.get('environment').add(water);
                }),
                new WindForm({
                    name: 'step3',
                    title: 'Wind <span class="sub-title">ADIOS Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
                }, wind).on('save', function(){
                    webgnome.model.get('environment').add(wind);
                }),
                new SpillTypeForm({
                    name: 'step4',
                    title: 'Select Spill Type <span class="sub-title">ADIOS Wizard</span>'
                }).on('select', _.bind(function(form){
                    form.title += '<span class="sub-title">ADIOS Wizard</span>';
                    form.name = 'step4';
                    form.$el.addClass('adios');
                    form.buttons = '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>';
                    this.register(form);
                    this.steps[this.step].on('hidden', _.bind(function(){
                        this.close();
                    }, this.steps[this.step]));
                    this.steps[this.step] = form;
                    form.on('save', function(){
                        webgnome.model.get('spills').add(form.model);
                    });
                }, this)),
                new TextForm({
                    name: 'step5',
                    title: 'Finalize Model <span class="sub-title">ADIOS Wizard</span>',
                    body: 'You\'re model is setup and ready to run',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="finish" data-dismiss="modal">Solve</button>'
                }).on('finish', function(){
                    webgnome.model.save().always(function(){
                        localStorage.setItem('view', 'fate');
                        webgnome.router.navigate('model', true);
                    });
                })
            ];
            this.start();
        },

        fail: function(){
            alert('Unabled to setup a new model on the server!');
            console.log('Unable to setup a new model on the server!');
        }

    });
    return adiosWizard;
});