define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/base',
    'views/form/risk/tuning',
    'views/form/risk/input',
    'views/modal/form',
    'model/risk/risk',
    'model/gnome',
], function($, _, Backbone, BaseWizard, TuningForm, InputForm, FormModal, RiskModel, GnomeModel){
    var riskWizardView = BaseWizard.extend({

        initialize: function(){
            webgnome.riskCalc = new RiskModel();
            this.setup(webgnome.riskCalc);
        },

        setup: function(riskModel){
            this.steps = [
                new InputForm({
                    name: 'step1',
                    title: 'Response Benefit <span class="sub-title">Input</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>'
                }, riskModel),
                new TuningForm({
                    name: 'step2',
                    title: 'Response Benefit <span class="sub-title">Tuning</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" data-dismiss="modal" class="finish">Re-run model</button>',
                }, riskModel).on('finish', function(){
                    riskModel.save(null, {
                        success: function(){
                            webgnome.model.save(null, {validate: false});
                        }
                    });
                })
            ];
            this.start();
        }

    });

    return riskWizardView;
});
