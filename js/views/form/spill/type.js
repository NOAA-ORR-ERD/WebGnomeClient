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
], function($, _, module, moment, FormModal, FormTemplate, SpillModel, PolygonReleaseModel,
    SpillContinueForm, SpatialSpillForm){
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
            if (_.isUndefined(options)){
                this.adiosMode = false;
            } else {
                this.adiosMode = options.adios;
            }
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(FormTemplate)();
            //this.buttons = null;
            FormModal.prototype.render.call(this, options);
            if (this.adiosMode){
                this.$('.spatial').hide();
            }
            this.$('.step2').hide();
        },
    
        instant: function(){
            var spill = new SpillModel();
            var rel = spill.get('release');
            rel.set('end_release_time', rel.get('release_time'));
            var spillForm = new SpillContinueForm(null, spill);
            this.trigger('select', spillForm);
            //hide last thing because it also closes this modal
            this.hide(function(){spillForm.render();});
        },

        continuous: function(){
            var spill = new SpillModel();
            var rel = spill.get('release');
            var rt = moment(rel.get('release_time')).add(12, 'h');
            rel.set('end_release_time', rt.format(webgnome.config.date_format.moment));
            var spillForm = new SpillContinueForm(null, spill);
            this.trigger('select', spillForm);
            this.hide(function(){spillForm.render();});
        },

        spatial: function(){
            var spill = new SpillModel();
            var rel = new PolygonReleaseModel();
            rel.set('end_release_time', rel.get('release_time'));
            spill.set('release', rel);
            var spillForm = new SpatialSpillForm(null, spill);
            this.trigger('select', spillForm);
            this.hide(function(){spillForm.render();});
        },

        well: function(){

        },

        pipeline: function(){

        }
    });

    return spillTypeForm;
});