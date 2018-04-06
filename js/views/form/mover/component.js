define([
    'backbone',
    'jquery',
    'underscore',
    'views/form/mover/base',
    'text!templates/form/mover/component.html',
    'views/modal/form'
], function(Backbone, $, _, BaseMoverForm, FormTemplate, FormModal){
    var componentForm = BaseMoverForm.extend({
        title: 'Edit Component Mover',
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