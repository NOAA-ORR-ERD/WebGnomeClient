define([
    'jquery',
    'underscore',
    'views/modal/form',
    'text!templates/form/persist_model.html'
], function($, _,
		    FormModal, PersistModelTemplate) {
    var persistModelModalForm = FormModal.extend({
        title: 'Save the Model on the Server',
        className: 'modal form-modal persist-model-form',

        initialize: function(options, modelFileName) {
            this.modelFileName = modelFileName;
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(){
            var persistModelTemplate = _.template(PersistModelTemplate);
            this.body = persistModelTemplate({'model_name': this.modelFileName});
            FormModal.prototype.render.call(this);
        },

        save: function(){
            this.modelFileName = this.$('#name')[0].value;
            FormModal.prototype.save.call(this);
        },
    });

    return persistModelModalForm;
});
