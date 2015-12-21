define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/base',
    'views/form/map/param',
    'views/form/risk/tuning',
    'views/form/risk/input',
    'model/risk/risk',
    'model/gnome',
], function($, _, Backbone, BaseWizard, ParamMapForm, TuningForm, InputForm, RiskModel, GnomeModel){
    var riskWizardView = BaseWizard.extend({
        initialize: function(){
            if(_.isUndefined(webgnome.riskCalc)){
                webgnome.riskCalc = new RiskModel();
            }
            this.setup(webgnome.riskCalc);
        },

        setup: function(riskModel){
            this.steps = [
                new InputForm({
                    name: 'step1',
                    title: 'Environmental Risk Assessment <span class="sub-title">Water Depth</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>'
                }, riskModel),
                new TuningForm({
                    name: 'step2',
                    title: 'Environmental Risk Assessment <span class="sub-title">Tuning</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="save">Save</button>',
                }, riskModel)
            ];
            if (webgnome.model.get('map').get('obj_type') === 'gnome.map.GnomeMap') {
                this.steps[0].buttons = '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="save">Save</button>';
                var paramMap = new ParamMapForm();
                paramMap.on('save', function(model){
                    webgnome.model.set('map', model);
                });
                this.steps.unshift(paramMap);
            }
            this.start();
        }

    });

    return riskWizardView;
});
