define([
    'jquery',
    'underscore',
    'module',
    'dropzone',
    'text!templates/default/dropzone.html',
    'text!templates/form/griddedwind.html',
    'text!templates/uploads/upload.html',
    'text!templates/uploads/upload_activate.html',
    'model/movers/py_wind',
    'views/modal/form',
    'views/uploads/upload_folder'
], function($, _, module, Dropzone, DropzoneTemplate,
            GriddedWindTemplate, UploadTemplate, UploadActivateTemplate,
            PyWindMover, FormModal, UploadFolder) {
    var griddedWindForm = FormModal.extend({
        className: 'modal form-modal griddedwind-form',
        title: 'Create Wind (Mover Only)',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function() {
            return _.defaults({
                'click .gridwind': 'gridwind',
            }, FormModal.prototype.events);
        },

        initialize: function(options) {
            this.module = module;

            FormModal.prototype.initialize.call(this, options);

            this.body = _.template(GriddedWindTemplate);
            //this.buttons = null;
        },

        render: function() {
            FormModal.prototype.render.call(this);
            this.$('.step2').hide();
        },

        nextStep: function(obj_type) {
            this.$('.step1').hide();
            this.$('.step2').show();

            this.setupUpload(obj_type);
        },

        setupUpload: function(obj_type) {
            this.$('#upload_form').empty();

            if (webgnome.config.can_persist) {
                this.$('#upload_form').append(_.template(UploadActivateTemplate));
            }
            else {
                this.$('#upload_form').append(_.template(UploadTemplate));
            }

            this.dropzone = new Dropzone('.dropzone', {
                url: webgnome.config.api + '/mover/upload',
                previewTemplate: _.template(DropzoneTemplate)(),
                paramName: 'new_mover',
                maxFiles: 1,
                //acceptedFiles: '.nc, .cur',
                dictDefaultMessage: 'Drop file here to upload (or click to navigate)' //<code>.nc, .cur, etc</code> 
            });

            this.dropzone.on('sending', _.bind(this.sending, {obj_type: obj_type}));
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('error', _.bind(this.reset, this));
            this.dropzone.on('success', _.bind(this.loaded, this));

            if (webgnome.config.can_persist) {
                this.uploadFolder = new UploadFolder({el: $(".upload-folder")});
                this.uploadFolder.on("activate-file", _.bind(this.activateFile, this));
                this.uploadFolder.render();
            }
        },

        sending: function(e, xhr, formData) {
            formData.append('session', localStorage.getItem('session'));
            formData.append('obj_type', this.obj_type);
            formData.append('persist_upload',
                            $('input#persist_upload')[0].checked);
        },

        progress: function(e, percent) {
            if (percent === 100) {
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },
        
        reset: function(file, immediate) {
            if (immediate) {
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }
            else {
                setTimeout(_.bind(function() {
                    this.$('.dropzone').removeClass('dz-started');
                    this.dropzone.removeFile(file);
                }, this), 10000);
            }
        },

        loaded: function(file, response) {
            var json_response = JSON.parse(response);
            var mover;

            if (json_response && json_response.obj_type) {
                if (json_response.obj_type === PyWindMover.prototype.defaults.obj_type) {
                    mover = new PyWindMover(json_response, {parse: true});
                }
                else {
                    console.error('Mover type not recognized: ',
                                  json_response.obj_type);
                }

                this.trigger('save', mover);
            }
            else {
                console.error('No response to file upload');
            }

            this.hide();
        },

        close: function() {
            if (this.dropzone) {
                this.dropzone.disable();
                $('input.dz-hidden-input').remove();
            }

            FormModal.prototype.close.call(this);
        },

        gridwind: function() {
            this.nextStep(PyWindMover.prototype.defaults.obj_type);
        },
        
        activateFile: function(filePath) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;

                $.post('/environment/activate', {'file-name': filePath})
                .done(function(response) {
                    thisForm.loaded(filePath, response);
                });
            }
        }
    });

    return griddedWindForm;
});
