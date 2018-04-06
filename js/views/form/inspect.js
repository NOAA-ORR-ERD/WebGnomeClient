define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/obj_inspect.html',
    'views/form/appearance'
], function($, _, Backbone, module, FormModal, FormTemplate, AppearanceForm){
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
            this.title = 'Edit '+ layer.model.get('name') +' (' + layer.model.get('obj_type').split('.').pop() + ') Appearance';
        },

        render: function(options){
            var formLabel;
            var appearanceModelsUsed = [];
            var originalAttrs = [];
            var html = $('<form></form>',{ 'class': 'form-horizontal obj-inspect', 'role': 'form'});
            if(this.layer.model.get('_appearance').models) { //collection of appearances
                var appearances = this.layer.model.get('_appearance').models;
                for(var i = 0; i < appearances.length; i++) {
                    formLabel = $('<label></label>', {class:"form-label", 'for':appearances[i].get('id')});
                    formLabel.text(appearances[i].get('ctrl_name'));
                    html.append(formLabel);
                    html.append(new AppearanceForm(appearances[i]).$el);
                    appearanceModelsUsed.push(appearances[i]);
                }
            } else {
                formLabel = $('<label></label>', {class:"form-label", 'for':this.layer.appearance.get('id')});
                formLabel.text(this.layer.appearance.get('ctrl_name'));
                html.append(formLabel);
                html.append(new AppearanceForm(this.layer.appearance).$el);
                appearanceModelsUsed.push(this.layer.appearance);
            }
            if(this.layer.model.has('grid')) {
                var grid = this.layer.model.get('grid');
                var appearance = grid.get('_appearance');
                formLabel = $('<label></label>', {class:"form-label", 'for': appearance.get('id')});
                formLabel.text(appearance.get('ctrl_name'));
                html.append(formLabel);
                html.append(new AppearanceForm(appearance).$el);
                appearanceModelsUsed.push(appearance);
            }
            this.appearanceModelsUsed = appearanceModelsUsed;
            this.body = html;

            FormModal.prototype.render.call(this, options);
            
        },

        update: function(e) {
            webgnome.model.get('_appearance').trigger('change', this.layer.model);
        },

        back: function() {
            //Resets all appearances to the default for the object.
            for (var i = 0; i < this.appearanceModelsUsed.length; i++) {
                var appearance = this.appearanceModelsUsed[i];
                var id = appearance.get('id');
                appearance.set(appearance.default);
                appearance.set('id', id);
            }
            webgnome.model.get('_appearance').trigger('change', this.layer.model);
            this.close();
        },

        
    });
    
    return inspectForm;
});