define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/spill/type.html',
    'model/spill',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'views/form/spill/well',
    'views/form/spill/pipeline'
], function($, _, Backbone, FormModal, FormTemplate, SpillModel,
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

        render: function(options){
            this.body = _.template(FormTemplate);
            this.buttons = null;
            FormModal.prototype.render.call(this, options);
        },

        instant: function(){
            var spill = new SpillModel();
            console.log(spill);
            this.on('hidden', _.bind(function(){
                var spillForm = new SpillInstantForm(null, spill);
                spillForm.render();
                spillForm.on('wizardclose', spillForm.close);
                spillForm.on('save', function(){
                    webgnome.model.get('spills').add(spill);
                    webgnome.model.save();
                    spillForm.on('hidden', function(){
                        spillForm.trigger('wizardclose');
                    });
                });
            }, this));
        },

        continue: function(){
            var spill = new SpillModel();
            this.on('hidden', _.bind(function(){
                var spillForm = new SpillContinueForm(null, spill);
                spillForm.render();
                spillForm.on('wizardclose', spillForm.close);
                spillForm.on('save', function(){
                    webgnome.model.get('spills').add(spill);
                    webgnome.model.save();
                    spillForm.on('hidden', function(){
                        spillForm.trigger('wizardclose');
                    });
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