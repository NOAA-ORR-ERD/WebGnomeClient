define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/modal',
    'lib/text!templates/wizard/step1.html',
    'lib/text!templates/wizard/step2.html',
    'lib/text!templates/wizard/step3.html',
    'lib/text!templates/wizard/step4.html',
    'models/gnome',
    'lib/jquery.datetimepicker'
], function($, _, Backbone, WizardModal, Step1Template, Step2Template, Step3Template, Step4Template, GnomeModel){
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
                    start_time: this.model.formatStartTime(),
                    duration: this.model.formatDuration()
                })
            });

            step.$('#start_time').datetimepicker({
                format: 'n/j/Y H:i'
            });

            step.on('next', function(){
                if(step.isValid()){
                    step.hide();
                    this.step2();
                } else {
                    step.error('Error!', step.validationError);
                }
                
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
            // setup the spill and attributes
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
        },

        close: function(){
            //this.spill.close();
            //this.location.close();
            this.model.close();

            this.unbind();
            this.remove();
        }

    });

    var step1 = WizardModal.extend({
        name: 'step1',
        title: 'Model Settings <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="next">Next</button>',
        validate: function(){
            if (this.$('form').length === 0) {
                return 'No form present so of course I\'m invalid';
            }
        }
    });

    var step2 = WizardModal.extend({
        name: 'step2',
        title: 'Location <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
    });

    var step3 = WizardModal.extend({
        name: 'step3',
        title: 'Spill <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
    });

    var step4 = WizardModal.extend({
        name: 'step4',
        title: 'Environment <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="finish">Finish</button>',
    });

    return wizardView;
});