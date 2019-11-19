define([
    'backbone',
    'jquery',
    'underscore',
    'module',
    'text!templates/form/mover/component.html',
    'views/modal/form'
], function(Backbone, $, _, module, FormTemplate, FormModal){
    'use strict';  
    var componentForm = FormModal.extend({
        
        className: 'modal form-modal model-form',
        title: 'Component Mover',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
        initialize: function(options, model){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = model;
        },
        render: function(options){
            this.body = _.template(FormTemplate, {
                model: this.model.toJSON(),
                winds: webgnome.model.getWinds()
            });

            FormModal.prototype.render.call(this, options);
        }
    });

    return componentForm;
});