define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/wizard/modal',
    'lib/text!templates/wizard/step1.html',
    'lib/text!templates/wizard/step2.html',
    'lib/text!templates/wizard/step3.html',
    'lib/text!templates/wizard/step4.html',
    'models/gnome',
    'lib/jquery.datetimepicker'
], function($, _, Backbone, moment, WizardModal, Step1Template, Step2Template, Step3Template, Step4Template, GnomeModel){
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

            step.$('#start_time').datetimepicker({
                format: 'Y/n/j G:i'
            });

            step.on('next', function(){
                // save the form inforation into the model
                //var start_time = new Date(step.$('#start_time').val().replace(/\//g, '-').replace(' ', 'T') + ':00.000');
                var start_time = moment(step.$('#start_time').val(), 'YYYY/M/D H:mm').unix();
                this.model.set('start_time', start_time);

                var days = step.$('#days').val();
                var hours = step.$('#hours').val();
                var duration = (((days * 24) + parseInt(hours, 10)) * 60) * 60;
                this.model.set('duration', duration);

                var uncertainty = step.$('#uncertainty:checked').val();
                this.model.set('uncertain', _.isUndefined(uncertainty) ? false : true);

                $('.xdsoft_datetimepicker').remove();

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
        }
    });

    var step2 = WizardModal.extend({
        name: 'step2',
        title: 'Map <span class="sub-title">New Model Wizard</span>',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',

        intialize: function(){
            
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
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="finish">Finish</button>',
    });

    return wizardView;
});