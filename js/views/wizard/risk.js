define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/base',
    'views/form/risk/input',
    'views/form/risk/tuning',
    'model/risk/risk',
    'model/gnome',
], function($, _, Backbone, BaseWizard, InputForm, TuningForm, RiskModel, GnomeModel){
    var riskWizardView = BaseWizard.extend({
        initialize: function(){
            risk_model = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.resources.Risk'});
            if(_.isUndefined(risk_model) || risk_model.length === 0){
                risk_model = new RiskModel();
            }
            this.setup();
        },

        setup: function(){
            this.steps = [
                new InputForm({
                    name: 'step1',
                    title: 'Environmental Risk Assessment <span class="sub-title">Input</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="next">Next</button>',
                }, risk_model),
                new TuningForm({
                    name: 'step2',
                    title: 'Environmental Risk Assessment <span class="sub-title">Tuning</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button>',
                }, risk_model)
            ];
            this.start();
        },

    });

    return riskWizardView;
});
