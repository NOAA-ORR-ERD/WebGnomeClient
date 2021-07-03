define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/response/type.html',
    'model/weatherers/burn',
    'model/weatherers/dispersion',
    'model/weatherers/skim',
    'views/form/response/insituBurn',
    'views/form/response/disperse',
    'views/form/response/skim',
    'model/weatherers/roc_skim',
    'views/form/response/roc_skim',
    'model/weatherers/roc_burn',
    'views/form/response/roc_burn',
    'model/weatherers/roc_disperse',
    'views/form/response/roc_disperse'
], function($, _, Backbone, module, FormModal, FormTemplate, 
    InSituBurnModel, DisperseModel, SkimModel, 
    InSituBurnForm, DisperseForm, SkimForm,
    ROCSkimModel, ROCSkimForm,
    ROCBurnModel, ROCBurnForm,
    ROCDisperseModel, ROCDisperseForm){
    'use strict';
    var responseTypeForm = FormModal.extend({
        title: 'Select Response Type',
        className: 'modal form-modal responsetype-form',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function(){
            return _.defaults({
                'click .adios-burn': 'adios_burn',
                'click .adios-disperse': 'adios_disperse',
                'click .adios-skim': 'adios_skim',
                'click .roc-burn': 'roc_burn',
                'click .roc-disperse': 'roc_disperse',
                'click .roc-skim': 'roc_skim'
            }, FormModal.prototype.events);
        },
        
        initialize: function(options){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.body = _.template(FormTemplate)();
        },

        render: function(){          
            FormModal.prototype.render.call(this);
        },

        adios_burn: function(){
            var insituBurn = new InSituBurnModel();
            this.defaultName(insituBurn);
            this.on('hidden', _.bind(function(){
                var inSituBurnForm = new InSituBurnForm(null, insituBurn);
                inSituBurnForm.render();
                inSituBurnForm.on('wizardclose', inSituBurnForm.close);
                inSituBurnForm.on('save', function(){
                    webgnome.model.get('weatherers').add(insituBurn);
                    webgnome.model.save(null, {validate: false});
                    inSituBurnForm.on('hidden', function(){
                        inSituBurnForm.trigger('wizardclose');
                    });
                });
            }, this));
        },

        adios_disperse: function(){
            var disperse = new DisperseModel();
            this.defaultName(disperse);
            this.on('hidden', _.bind(function(){
                var disperseForm = new DisperseForm(null, disperse);
                disperseForm.render();
                disperseForm.on('wizardclose', disperseForm.close);
                disperseForm.on('save', function(){
                    webgnome.model.get('weatherers').add(disperse);
                    webgnome.model.save(null, {validate: false});
                    disperseForm.on('hidden', function(){
                        disperseForm.trigger('wizardclose');
                    });
                });
            }, this));
        },

        adios_skim: function(){
            var skim = new SkimModel();
            this.defaultName(skim);
            this.on('hidden', _.bind(function(){
                var skimForm = new SkimForm(null, skim);
                skimForm.render();
                skimForm.on('wizardclose', skimForm.close);
                skimForm.on('save', function(){
                    webgnome.model.get('weatherers').add(skim);
                    webgnome.model.save(null, {validate: false});
                    skimForm.on('hidden', function(){
                        skimForm.trigger('wizardclose');
                    });
                });
            }, this));
        },

        roc_burn: function(){
            var burn = new ROCBurnModel();
            this.defaultName(burn);
            this.on('hidden', _.bind(function(){
                var form = new ROCBurnForm({model: burn});
                form.render();
                form.on('wizardclose', form.close);
                form.on('save', function(){
                    webgnome.model.get('weatherers').add(burn);
                    webgnome.model.save(null, {validate: false});
                    form.on('hidden', function(){
                        form.trigger('wizardclose');
                    });
                });
            }));
        },

        roc_disperse: function(){
            var disperse = new ROCDisperseModel();
            this.defaultName(disperse);
            this.on('hidden', _.bind(function(){
                var form = new ROCDisperseForm({model: disperse});
                form.render();
                form.on('wizardclose', form.close);
                form.on('save', function(){
                    webgnome.model.get('weatherers').add(disperse);
                    webgnome.model.save(null, {validate: false});
                    form.on('hidden', function(){
                        form.trigger('wizardclose');
                    });
                });
            }));

        },

        roc_skim: function(){
            var skim = new ROCSkimModel();
            this.defaultName(skim);
            this.on('hidden', _.bind(function(){
                var form = new ROCSkimForm({model: skim});
                form.render();
                form.on('wizardclose', form.close);
                form.on('save', function(){
                    webgnome.model.get('weatherers').add(skim);
                    webgnome.model.save(null, {validate: false});
                    form.on('hidden', function(){
                        form.trigger('wizardclose');
                    });
                });
            }, this));
        },

        defaultName: function(responseModel){
            var existing = webgnome.model.get('weatherers').where({obj_type: responseModel.get('obj_type')});
            var num = 1;
            if(existing){
                num = existing.length + 1;
            }
            responseModel.set('name', responseModel.get('name') + ' #' + num);
        }
    });

    return responseTypeForm;
});