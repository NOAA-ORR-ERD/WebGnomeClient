define([
    'jquery',
    'underscore',
    'module',
    'moment',
    'views/modal/form',
    'text!templates/form/spill/type.html',
    'model/spill/spill',
    'model/spill/spatialrelease',
    'views/form/spill/continue',
    'views/form/spill/spatial',
    'views/form/spill/well',
    'views/form/spill/pipeline'
], function($, _, module, moment, FormModal, FormTemplate, SpillModel, SpatialReleaseModel,
    SpillContinueForm, SpatialSpillForm, SpillWellForm, SpillPipeForm){
    'use strict';
    var spillTypeForm = FormModal.extend({
        title: 'Select Spill Type',
        className: 'modal form-modal spilltype-form',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function(){
            return _.defaults({
                'click .instant': 'instant',
                'click .continuous': 'continuous',
                'click .spatial': 'spatial',
                'click .pipeline': 'pipeline',
                'click .well-blowout': 'well'
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            this.adiosMode = options.adios
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(FormTemplate);
            //this.buttons = null;
            FormModal.prototype.render.call(this, options);
            if (this.adiosMode){
                this.$('.spatial').hide();
            }
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
            var rel = spill.get('release');
            rel.set('end_release_time', rel.get('release_time'));
            var spillForm = new SpillContinueForm(null, spill);
            spillForm.on('save', _.bind(function(model) {
                webgnome.model.get('spills').add(spillForm.model);
            }, this));
            this.on('hidden', function(){
                spillForm.render();
            });
            this.trigger('select', spillForm);
        },

        continuous: function(){
            var spill = new SpillModel();
            var rel = spill.get('release');
            var rt = moment(rel.get('release_time')).add(12, 'h');
            rel.set('end_release_time', rt.format(webgnome.config.date_format.moment));
            var spillForm = new SpillContinueForm(null, spill);
            spillForm.on('save', _.bind(function(model) {
                webgnome.model.get('spills').add(spillForm.model);
            }, this));
            this.on('hidden', function(){
                spillForm.render();
            });
            this.trigger('select', spillForm);
        },

        spatial: function(){
            var spill = new SpillModel();
            var rel = new SpatialReleaseModel();
            rel.set('end_release_time', rel.get('release_time'));
            spill.set('release', rel);
            var spillForm = new SpatialSpillForm(null, spill);
            spillForm.on('save', _.bind(function(model) {
                webgnome.model.get('spills').add(spillForm.model);
            }, this));
            this.on('hidden', function(){
                spillForm.render();
            });
            this.trigger('select', spillForm);
        },

        well: function(){

        },

        pipeline: function(){

        }
    });

    return spillTypeForm;
});