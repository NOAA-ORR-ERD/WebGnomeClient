define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/mover/edit.html',
], function($, _, Backbone, module, FormModal, FormTemplate){
    'use strict';
    var BaseMoverForm = FormModal.extend({
        className: 'modal form-modal model-form',
        title: 'Gridded Currents ',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
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
        }

    });
    
    return BaseMoverForm;
});