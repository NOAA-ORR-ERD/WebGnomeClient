define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/base',
    'views/form/spill/instant',
    'views/form/spill/continue'
], function($, _, Backbone, BaseWizard, InstantSpillForm, ContinuousSpillForm){
    'use strict';
    var spillComplianceWizard = BaseWizard.extend({

        initialize: function(options) {
            BaseWizard.prototype.initialize.call(options);
            var spills = webgnome.model.get('spills');
            this.invalidSpills = [];

            for (var i = 0; i < spills.length; i++) {
                var spill = spills.at(i);

                if (!spill.isValid()) {
                    this.invalidSpills.push(spill);
                }
            }
        },

        setup: function() {
            var spills = this.invalidSpills;

            for (var i = 0; i < spills.length; i++) {
                var spill = spills[i];
                var spillView, buttons;
                var spillType = spill.spillType();
                
                if (i + 1 === spills.length) {
                    buttons = '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" data-dismiss="modal" class="finish">Finish</button>';
                } else if (i === 0) {
                    buttons = '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>';
                } else {
                    buttons = '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="back">Back</button><button type="button" class="save">Save</button>';
                }

                if (spillType === 'instant') {
                    spillView = new InstantSpillForm({model: spill, buttons: buttons});
                } else if (spillType === 'continuous') {
                    spillView = new ContinuousSpillForm({model: spill, buttons: buttons});
                }
                this.steps.push(spillView);
            }

            if (this.steps.length > 0) {
                this.start();
            }
        }
    });

    return spillComplianceWizard;
});