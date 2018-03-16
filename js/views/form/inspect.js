define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/obj_inspect.html',
    'views/form/appearance'
], function($, _, Backbone, module, FormModal, FormTemplate, AppearanceView){
    'use strict';
    var inspectForm = FormModal.extend({
        /*
        Modal for inspecting objects in the trajectory view layers menu. Presents metadata about the object and configuration for its Appearance
        */
        className: 'modal form-modal inspect-form',
        title: 'Object Properties',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
        events: function() {
            return _.defaults({
                
            }, FormModal.prototype.events);
        },
        
        initialize: function(options, layer){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.layer = layer;
            this.title = 'Edit '+ layer.model.get('name') +' (' + layer.model.get('obj_type').split('.').pop() + ') Appearance'
        },

        render: function(options){
            var appearanceModelsUsed = [];
            var originalAttrs = [];
            var html = $('<form></form>',{ 'class': 'form-horizontal obj-inspect', 'role': 'form'});
            if(this.layer.model.get('_appearance').models) { //collection of appearances
                var appearances = this.layer.model.get('_appearance').models;
                for(var i = 0; i < appearances.length; i++) {
                    var formLabel = $('<label></label>', {class:"form-label", 'for':appearances[i].get('id')})
                    formLabel.text(appearances[i].get('ctrl_name'));
                    html.append(formLabel);
                    html.append(new AppearanceView(appearances[i]).$el);
                }
            } else {
                var formLabel = $('<label></label>', {class:"form-label", 'for':this.layer.appearance.get('id')})
                formLabel.text(this.layer.appearance.get('ctrl_name'));
                html.append(formLabel);
                html.append(new AppearanceView(this.layer.appearance).$el);
            }
            if(this.layer.model.has('grid')) {
                var grid = this.layer.model.get('grid');
                var appearance = grid.get('_appearance');
                var formLabel = $('<label></label>', {class:"form-label", 'for': appearance.get('id')})
                formLabel.text(appearance.get('ctrl_name'));
                html.append(formLabel);
                html.append(new AppearanceView(appearance).$el);
            }

            
            this.body = html

            FormModal.prototype.render.call(this, options);
            
        },



        update: function(e) {

            var name = this.$('#name').val();
            if (name !== this.layer.model.get('name')) {
                this.layer.model.set('name', name);
                this.layer.model.save();
            }

        },

        save: function() {
            
        }


    });
    
    return inspectForm;
});