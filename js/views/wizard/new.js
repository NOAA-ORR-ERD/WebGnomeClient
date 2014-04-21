define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/modal',
    'lib/text!templates/wizard/new/step1.html',
    'lib/text!templates/wizard/new/step2.html',
    'lib/text!templates/wizard/new/step3.html',
    'lib/text!templates/wizard/new/step4.html',
    'models/wizard/new'
], function($, _, Backbone, WizardModal, Step1Template, Step2Template, Step3Template, Step4Template, WizardNewModel){
    var wizardNewView = Backbone.View.extend({
        step_num: 1,
        model: new WizardNewModel(),

        initialize: function(){
            this.step1();
            this.model.fetch();
        },

        step1: function(){
            // setup the model settings
            var step = new step1();

            step.on('next', function(){
                this.step2();
            }, this);

            step.on('wizardclose', function(){
                this.close();
            }, this);
        },

        step2: function(){
            // setup the location for the model
            var step = new step2();
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
            // setup the spill location and attributes
            var step = new step3();

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
            var step = new step4();

            step.on('back', function(){
                this.step3();
            }, this);

            step.on('wizardclose', function(){
                this.close();
            }, this);
        }

    });

    var step1 = WizardModal.extend({
        name: 'step1',
        title: 'Model Settings <span class="sub-title">New Model Wizard</span>',
        body: _.template(Step1Template),
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="next">Next</button>',
    });

    var step2 = WizardModal.extend({
        name: 'step2',
        title: 'Location <span class="sub-title">New Model Wizard</span>',
        body: _.template(Step2Template),
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
    });

    var step3 = WizardModal.extend({
        name: 'step3',
        title: 'Spill <span class="sub-title">New Model Wizard</span>',
        body: _.template(Step3Template),
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
    });

    var step4 = WizardModal.extend({
        name: 'step4',
        title: 'Environment <span class="sub-title">New Model Wizard</span>',
        body: _.template(Step4Template),
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="finish">Finish</button>',
    });

    return wizardNewView;
});