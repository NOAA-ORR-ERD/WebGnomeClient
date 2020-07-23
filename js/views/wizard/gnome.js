define([
    'underscore',
    'views/wizard/base',
    'views/form/model',
    'views/form/water',
    'views/form/wind',
    'views/form/map/type',
    'views/form/spill/type',
    'views/form/text',
    'model/gnome',
    'model/environment/wind',
    'model/environment/water'
], function(_, BaseWizard, ModelForm, WaterForm, WindForm, MapTypeForm, SpillTypeForm, TextForm,
        GnomeModel, WindModel){
    var gnomeWizard = BaseWizard.extend({
        initialize: function(){
            webgnome.model = new GnomeModel({name: 'GNOME Model'});
            webgnome.model.save(null, {
                validate: false,
                error: this.fail,
                success: _.bind(this.setup, this)
            });
        },

        setup: function(){
            var wind = new WindModel();

            this.steps = [
                new ModelForm({
                    name: 'step1',
                    title: 'Model Settings <span class="sub-title">GNOME Wizard</span>',
                    buttons: '<button type="button" class="cancel">Cancel</button><button type="button" class="next">Next</button>',
                }, webgnome.model),
                new WindForm({
                    name: 'step2',
                    title: 'Wind <span class="sub-title">GNOME Wizard</span>',
                    buttons: '<button type="button" class="cancel">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
                }, wind).on('save', function(){
                    webgnome.model.get('environment').add(wind);
                }),
                new MapTypeForm({
                    name: 'step3',
                    title: 'Select Map Type <span class="sub-title">GNOME Wizard</span>',
                    className: 'modal form-modal shorelinetype-form gnome'
                }).on('select', _.bind(function(form){
                    form.title += '<span class="sub-title">ADIOS Wizard</span>';
                    form.name = 'step3';
                    form.buttons = '<button type="button" class="cancel">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>';
                    this.register(form);
                    this.steps[this.step].on('hidden', _.bind(function(){
                        this.close();
                    }, this.steps[this.step]));
                    this.steps[this.step] = form;
                    form.on('save', function(){
                        webgnome.model.get('spills').add(form.model);
                    });
                }, this)),
                new SpillTypeForm({
                    name: 'step4',
                    title: 'Select Spill Type <span class="sub-title">GNOME Wizard</span>'
                }).on('select', _.bind(function(form){
                    form.title += '<span class="sub-title">GNOME Wizard</span>';
                    form.name = 'step5';
                    form.$el.addClass('gnome');
                    form.buttons = '<button type="button" class="cancel">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>';
                    this.register(form);
                    this.steps[this.step].on('hidden', _.bind(function(){
                        this.close();
                    }, this.steps[this.step]));
                    this.steps[this.step] = form;
                    form.on('save', function(){
                        webgnome.model.get('spills').add(form.model);
                    });
                }, this)),
            ];

            this.start();
        },

    });

    return gnomeWizard;
});