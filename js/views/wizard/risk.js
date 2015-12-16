define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/base',
    'views/form/map/param',
    'views/form/risk/tuning',
    'model/risk/risk',
    'model/gnome',
], function($, _, Backbone, BaseWizard, ParamMapForm, TuningForm, RiskModel, GnomeModel){
    var riskWizardView = BaseWizard.extend({
        initialize: function(){
            if(_.isUndefined(webgnome.riskCalc)){
                webgnome.riskCalc = new RiskModel();
            }
            this.setup(webgnome.riskCalc);
        },

        setup: function(riskModel){
            this.steps = [
                new TuningForm({
                    name: 'step2',
                    title: 'Environmental Risk Assessment <span class="sub-title">Tuning</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="save">Save</button>',
                }, riskModel)
            ];
            if (webgnome.model.get('map').get('obj_type') === 'gnome.map.GnomeMap') {
                this.steps.unshift(new ParamMapForm());
            }
            this.start();
        },

    });

    return riskWizardView;
});
