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
    'views/form/response/skim'
], function($, _, Backbone, module, FormModal, FormTemplate, InSituBurnModel, DisperseModel, SkimModel, 
    InSituBurnForm, DisperseForm, SkimForm){
    'use strict';
    var responseTypeForm = FormModal.extend({
        title: 'Select Response Type',
        className: 'modal form-modal responsetype-form',

        events: function(){
            return _.defaults({
                'click .burn': 'burn',
                'click .disperse': 'disperse',
                'click .skim': 'skim'
            }, FormModal.prototype.events);
        },

        render: function(options){
            this.module = module;
            this.body = _.template(FormTemplate);
            this.buttons = null;
            FormModal.prototype.render.call(this, options);
        },

        burn: function(){
            var insituBurn = new InSituBurnModel();
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

        disperse: function(){
            var disperse = new DisperseModel();
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

        skim: function(){
            var skim = new SkimModel();
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
        }

    });

    return responseTypeForm;
});