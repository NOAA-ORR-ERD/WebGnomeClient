define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/spill/type.html',
    'model/spill/spill',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'views/form/spill/well',
    'views/form/spill/pipeline'
], function($, _, Backbone, module, FormModal, FormTemplate, SpillModel,
    SpillInstantForm, SpillContinueForm, SpillWellForm, SpillPipeForm){
    'use strict';
    var spillTypeForm = FormModal.extend({
        title: 'Select Spill Type',
        className: 'modal form-modal spilltype-form',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

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
            //this.buttons = null;
            FormModal.prototype.render.call(this, options);
            this.$('.step2').hide();
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
                if (!_.isUndefined(webgnome.router.views[1].updateSpill)){
                    webgnome.router.views[1].updateSpill();
                }
            });
        },

        instant: function(){
            var spill = new SpillModel();
            spill.release.set('end_release_time', spill.release.get('release_time'));
            var spillForm = new SpillContinueForm(null, spill);
            this.on('hidden', _.bind(function(){
                this.spillHiddenCB(spillForm);
            }, this));
        },

        continue: function(){
            var spill = new SpillModel();
            var rt = moment(spill.release.get('release_time')).add(1, 'hr');
            spill.release.set('end_release_time', rt.format(webgnome.config.date_format.moment));
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