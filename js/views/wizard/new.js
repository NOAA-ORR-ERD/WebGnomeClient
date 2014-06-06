define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/default',
    'views/form/model',
    'views/form/map',
    'views/form/spill',
    'views/form/environment',
    'model/gnome',
    'model/map',
    'collection/spills',
], function($, _, Backbone, DefaultWizard, ModelForm, MapForm, SpillForm, EnvironmentForm, GnomeModel, GnomeMap, GnomeSpills){
    var newWizardView = DefaultWizard.extend({
        initialize: function(){
            this.model = new GnomeModel();
            this.steps = [
                new ModelForm({
                    name: 'step1',
                    title: 'Model Settings <span class="sub-title">New Model Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="next">Next</button>',
                }, this.model),
                new MapForm({
                    name: 'step2',
                    title: 'Map <span class="sub-title">New Model Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
                }, this.model.get('map')),
                new SpillForm({
                    name: 'step3',
                    title: 'Spill <span class="sub-title">New Model Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button>',
                }, this.model.get('spills'), this.model.get('map'))
            ];
            this.start();
        }
    });

    return newWizardView;
});