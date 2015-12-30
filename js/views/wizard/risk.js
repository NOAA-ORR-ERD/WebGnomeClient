define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/base',
    'views/form/map/param',
    'views/form/risk/tuning',
    'views/form/risk/input',
    'views/modal/form',
    'model/risk/risk',
    'model/gnome',
], function($, _, Backbone, BaseWizard, ParamMapForm, TuningForm, InputForm, FormModal, RiskModel, GnomeModel){
    var riskWizardView = BaseWizard.extend({

        initialize: function(){
            if(_.isUndefined(webgnome.riskCalc)){
                webgnome.riskCalc = new RiskModel();
            }
            this.setup(webgnome.riskCalc);
        },

        setup: function(riskModel){
            if (webgnome.model.get('map').get('obj_type') === 'gnome.map.GnomeMap') {
                var paramMap = new ParamMapForm({
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="finish">Re-run Model</button>',
                    riskAssess: true
                });
                paramMap.on('finish', function(){
                    var model = paramMap.model;
                    webgnome.model.set('map', model);
                });
                this.steps = [
                    new FormModal({
                        name: 'step1',
                        title: 'A Map Is Necessary',
                        body: '<p>In order for risk assessment to work properly you must select a map for the model run.</p>'
                    }),
                    paramMap
                ];
            } else {
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
            }
            this.start();
        }

    });

    return riskWizardView;
});
