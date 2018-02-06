define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/mover/base',
    'text!templates/form/mover/edit.html',
    'views/modal/form'
], function($, _, Backbone, module, BaseMoverForm, FormTemplate, FormModal){
    'use strict';
    var modelForm = BaseMoverForm.extend({
        render: function(options){
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                active: this.model.get('on'),
                scale_value: this.model.get('scale_value')
            });
            FormModal.prototype.render.call(this, options);
        }
    });
    
    return modelForm;
});