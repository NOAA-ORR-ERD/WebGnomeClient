define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/obj_inspect.html',
], function($, _, Backbone, module, FormModal, FormTemplate){
    'use strict';
    var inspectForm = FormModal.extend({
        /*
        Modal for inspecting objects in the trajectory view layers menu. Presents metadata about the object and configuration for its Appearance
        */
        className: 'modal form-modal inspect-form',
        title: 'Object Properties',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
        events: function() {
            return _.defaults({}, FormModal.prototype.events);
        },
        
        initialize: function(options, layer){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.layer = layer;
        },

        render: function(options){
            
            
            this.body = _.template(FormTemplate, {
                name: this.layer.model.get('name'),
                active: this.layer.appearance.get('on'),
                
                
            });

            FormModal.prototype.render.call(this, options);
            
        },

        update: function() {

            var name = this.$('#name').val();
            if (name !== this.layer.model.get('name')) {
                this.layer.model.set('name', name);
                this.layer.model.save();
            }

        },


    });
    
    return inspectForm;
});