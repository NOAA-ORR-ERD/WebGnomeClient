define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/mover/edit.html',
], function($, _, Backbone, module, FormModal, FormTemplate){
    'use strict';
    var modelForm = FormModal.extend({
        className: 'modal form-modal model-form',
        title: 'Edit Current Attributes ',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
        events: function() {
            return _.defaults({}, FormModal.prototype.events);
        },
        
        initialize: function(options, model){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = model;
        },

        render: function(options){
            
            
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                active: this.model.get('on'),
                scale_value: this.model.get('scale_value')
            });

            FormModal.prototype.render.call(this, options);
            
        },

        update: function() {

            var name = this.$('#name').val();
            var active = this.$('#active:checked').val();
            var scale_value = this.$('#scale_value').val();
            
            this.model.set('name', name);
            this.model.set('on', _.isUndefined(active) ? false : true);
            this.model.set('scale_value', scale_value);

        },


    });
    
    return modelForm;
});