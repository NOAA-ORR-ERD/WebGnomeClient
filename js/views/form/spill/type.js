define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/spill/type.html',
    'model/spill',
    'model/release',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'views/form/spill/well',
    'views/form/spill/pipeline'
], function($, _, Backbone, module, FormModal, FormTemplate, SpillModel, GnomeRelease,
    SpillInstantForm, SpillContinueForm, SpillWellForm, SpillPipeForm){
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

        instant: function(){
            var spill = new SpillModel({release: new GnomeRelease()});
            this.on('hidden', _.bind(function(){
                var spillForm = new SpillInstantForm(null, spill);
                spillForm.render();
                spillForm.on('wizardclose', spillForm.close);
                spillForm.on('save', function(){
                    webgnome.model.get('spills').add(spill);
                    webgnome.model.save(null, {validate: false});
                    spillForm.on('hidden', function(){
                        spillForm.trigger('wizardclose');
                    });
                    webgnome.router.views[1].updateSpill();
                });
            }, this));
        },

        continue: function(){
            var spill = new SpillModel({release: new GnomeRelease()});
            this.on('hidden', _.bind(function(){
                var spillForm = new SpillContinueForm(null, spill);
                spillForm.render();
                spillForm.on('wizardclose', spillForm.close);
                spillForm.on('save', function(){
                    webgnome.model.get('spills').add(spill);
                    webgnome.model.save(null, {validate: false});
                    spillForm.on('hidden', function(){
                        spillForm.trigger('wizardclose');
                    });
                    webgnome.router.views[1].updateSpill();
                });
            }, this));
        },

        well: function(){

        },

        pipeline: function(){

        }
    });

    return spillTypeForm;
});