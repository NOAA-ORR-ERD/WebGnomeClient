define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/form/model',
    'views/form/map',
    'views/form/spill',
    'views/form/environment',
    'model/gnome',
    'model/map',
    'collection/spills',
    'lib/jquery.datetimepicker',
    'lib/jquery.fileupload'
], function($, _, Backbone, moment, ModelForm, MapForm, SpillForm, EnvironmentForm, GnomeModel, GnomeMap, GnomeSpills){
    var newWizardView = Backbone.View.extend({
        step_num: 1,

        initialize: function(){
            this.model = new GnomeModel();
            this.map = new GnomeMap();
            this.spills = new GnomeSpills();
            this.step1();
        },

        step1: function(){
            // setup the model settings
            var step = new ModelForm({
                name: 'step1',
                title: 'Model Settings <span class="sub-title">New Model Wizard</span>',
                buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="next">Next</button>',
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
            var step = new MapForm({
                name: 'step2',
                title: 'Map <span class="sub-title">New Model Wizard</span>',
                buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
            }, this.map);

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
            var step = new SpillForm({
                name: 'step3',
                title: 'Spill <span class="sub-title">New Model Wizard</span>',
                buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
            }, this.spills, this.map);

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
            var step = new EnvironmentForm({
                name: 'step4',
                title: 'Environment <span class="sub-title">New Model Wizard</span>',
                buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="finish" data-dismiss="modal">Build</button>',
            });

            step.on('back', function(){
                this.step3();
            }, this);

            step.on('wizardclose', function(){
                this.close();
                this.setup();
            }, this);
        },

        setup: function(){
            // attempt to setup a full model with all of the associated objects the
            // user has detailed here.


            // validate that all the objects are setup and correct.


            // if their not direct the user to the correct form that needs to be fixed.


            // build the model and pass it to the active webgnome model holder.

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

    return newWizardView;
});