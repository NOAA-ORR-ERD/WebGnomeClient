define([
    'backbone',
    'jquery',
    'underscore',
    'dropzone',
    'text!templates/default/dropzone.html',
    'text!templates/form/mover/cats.html',
    'views/form/mover/base',
    'views/modal/form',
    'model/environment/tide'
], function(Backbone, $, _, Dropzone,
            DropzoneTemplate, FormTemplate,
            BaseMoverForm, FormModal, TideModel) {
    var catsForm = BaseMoverForm.extend({
        title: 'Edit CATS Mover',

        events: function() {
            return _.defaults({
                'click .new-tide': 'newTide'
            }, BaseMoverForm.prototype.events);
        },

        render: function(options) {
            this.body = this.template();
            FormModal.prototype.render.call(this, options);
        },

        template: function() {
            return _.template(FormTemplate, {
                model: this.model.toJSON(),
                tides: webgnome.model.getTides()
            });
        },

        newTide: function() {
            this.$('.tide-upload').removeClass('hidden');

            this.dropzone = new Dropzone('.tide-upload', {
                url: webgnome.config.api + '/environment/upload',
                previewTemplate: _.template(DropzoneTemplate)(),
                paramName: 'new_environment',
                maxFiles: 1,
                acceptedFiles: '.cur, .txt',
                dictDefaultMessage: 'Drop tide file here to upload (or click to navigate)'
            });

            this.dropzone.on('sending', _.bind(this.sending, this));
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('error', _.bind(this.reset, this));
            this.dropzone.on('success', _.bind(this.loaded, this));
        },

        sending: function(e, xhr, formData, obj_type) {
            formData.append('session', localStorage.getItem('session'));
            formData.append('obj_type', this.obj_type);
        },

        progress: function(e, percent) {
            if (percent === 100) {
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },

        reset: function(file) {
            setTimeout(_.bind(function() {
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }, this), 3000);
        },

        loaded: function(e, response) {
            var tide = new TideModel(JSON.parse(response), {parse: true});

            tide.save(null, {
                success: _.bind(function() {
                    webgnome.model.get('environment').add(tide);
                    webgnome.model.save();

                    this.model.set('tide', tide);
                    this.dropzone.removeAllFiles(true);
                    this.dropzone.disable();

                    $('input.dz-hidden-input').remove();
                    this.$('.form-horizontal').remove();
                    this.$('.modal-body').prepend(this.template());

                    this.sync();
                }, this),
                error: _.bind(function(e, response) {
                    this.error(response.responseText);
                    this.dropzone.removeAllFiles(true);
                }, this)
            });
        },

        close: function() {
            if (this.dropzone) {
                this.dropzone.disable();
                $('input.dz-hidden-input').remove();    
            }

            FormModal.prototype.close.call(this);
        }
    });

    return catsForm;
});
