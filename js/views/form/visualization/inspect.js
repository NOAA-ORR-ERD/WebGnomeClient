define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/visualization/inspect.html',
    'views/form/visualization/appearance',
    'views/form/visualization/spill_appearance'
], function($, _, Backbone, module, FormModal, FormTemplate, AppearanceForm, SpillAppearanceForm){
    'use strict';
    var inspectForm = FormModal.extend({
        /*
        Modal for inspecting objects in the trajectory view layers menu. Presents metadata about the object and configuration for its Appearance
        */
        className: 'modal form-modal inspect-form',
        title: 'Object Properties',
        buttons: //'<button type="button" class="cancel" data-dismiss="modal">Cancel</button>' + 
                 '<button type="button" class="back">Reset to Default</button>'+
                 '<button type="button" class="save">Save</button>',
        
        events: function() {
            return _.defaults({
                
            }, FormModal.prototype.events);
        },
        
        initialize: function(options, layer){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.layer = layer;
            this.title = 'Edit Layer Properties: '+ layer.model.get('name');
            this.appearanceModelsUsed = [];
        },

        render: function(options) {
            var formType;
            var html = $('<form></form>',{ 'class': 'form-horizontal obj-inspect', 'role': 'form'});
            if (this.layer.model.get('obj_type').includes('spill')){
                formType = SpillAppearanceForm;
            } else {
                formType = AppearanceForm;
            }
            if(this.layer.model.get('_appearance').models) {
                this.layer.model.get('_appearance').models.forEach(
                    function(a) {
                        this.appearanceModelsUsed.push(a);
                    }, this
                );
            } else {
                this.appearanceModelsUsed.push(this.layer.appearance);
            }
            if(this.layer.model.has('grid')) {
                this.appearanceModelsUsed.push(this.layer.model.get('grid').get('_appearance'));
            }
            this.appearanceModelsUsed.forEach(
                function(a) {
                    if (!_.isUndefined(a.get('ctrl_names').title)) {
                        var formLabel = $('<label></label>', {class:"form-label", 'for':a.get('id')})
                                        .text(a.get('ctrl_names').title);
                        html.append(formLabel);
                    }
                    var app = new formType(a, this.layer.model);
                    html.append(app.$el);
                }, this
            );
            this.body = html;
            FormModal.prototype.render.call(this, options);
        },

        update: function(e) {
            //this trigger is to let the layers panel know that it needs to re-render!
            //webgnome.model.get('_appearance').trigger('change', this.layer.model);
            this.trigger('rerender');
        },

        back: function() {
            //Resets all appearances to the default for the object.
            for (var i = 0; i < this.appearanceModelsUsed.length; i++) {
                var appearance = this.appearanceModelsUsed[i];
                var id = appearance.get('id');
                appearance.set(appearance.defaults());
                appearance.set('id', id);
                if (this.layer.model.get('obj_type').includes('spill')){
                    this.layer.model.setupVis();
                }
                appearance.save();
            }
            this.appearanceModelsUsed = [];
            this.$el.html('');
            this.render();
        },

        save: function() {
            for (var i = 0; i < this.appearanceModelsUsed.length; i++) {
                this.appearanceModelsUsed[i].save();
            }
            FormModal.prototype.save.call(this);
        }

        
    });
    
    return inspectForm;
});