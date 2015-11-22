define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/spill/type.html',
    'model/spill',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'views/form/spill/well',
    'views/form/spill/pipeline'
], function($, _, Backbone, module, FormModal, FormTemplate, SpillModel,
    SpillInstantForm, SpillContinueForm, SpillWellForm, SpillPipeForm){
    'use strict';
    var spillTypeForm = FormModal.extend({
        title: 'Select Spill Type',
        className: 'modal fade form-modal spilltype-form',

        events: function(){
            return _.defaults({
                'click .instant': 'instant',
                'click .continue': 'continue',
                'click .pipeline': 'pipeline',
                'click .well-blowout': 'well'
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(FormTemplate);
            this.buttons = null;
            FormModal.prototype.render.call(this, options);
        },

        spillHiddenCB: function(spillForm) {
            spillForm.render();
            spillForm.on('wizardclose', spillForm.close);
            spillForm.on('save', function(){
                webgnome.model.get('spills').add(spillForm.model);
                webgnome.model.save(null, {validate: false});
                spillForm.on('hidden', function(){
                    spillForm.trigger('wizardclose');
                });
                webgnome.router.views[1].updateSpill();
            });
        },

        instant: function(){
            var spill = new SpillModel();
            var spillForm = new SpillInstantForm(null, spill);
            this.on('hidden', _.bind(function(){
                this.spillHiddenCB(spillForm);
            }, this));
        },

        continue: function(){
            var spill = new SpillModel();
            var spillForm = new SpillContinueForm(null, spill);
            this.on('hidden', _.bind(function(){
                this.spillHiddenCB(spillForm);
            }, this));
        },

        well: function(){

        },

        pipeline: function(){

        }
    });

    return spillTypeForm;
});