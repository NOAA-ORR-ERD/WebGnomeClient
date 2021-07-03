define([
    'jquery',
    'underscore',
    'views/modal/form',
    'text!templates/form/create_file.html'
], function($, _, FormModal, CreateFileTemplate) {
    var createFileModalForm = FormModal.extend({
        title: 'Create New Folder',
        className: 'modal form-modal create-file-form',

        initialize: function(options, fileModel) {
            this.fileModel = fileModel;
            FormModal.prototype.initialize.call(this, options);
        },

        render: function() {
            var createFileTemplate = _.template(CreateFileTemplate);
            this.body = createFileTemplate({'file': this.fileModel});
            FormModal.prototype.render.call(this);
        },

        save: function() {
            var fileName = this.$('#name')[0].value;
            this.fileModel.set('name', fileName);
            FormModal.prototype.save.call(this);
        },
    });

    return createFileModalForm;
});
