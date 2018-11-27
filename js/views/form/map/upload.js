define([
    'underscore',
    'jquery',
    'backbone',
    'views/modal/form',
    'views/uploads/upload_folder',
    'text!templates/uploads/upload.html',
    'text!templates/uploads/upload_activate.html',
    'dropzone',
    'text!templates/default/dropzone.html',
    'model/map/bna'
], function(_, $, Backbone, FormModal, UploadFolder,
            UploadTemplate, UploadActivateTemplate,
            Dropzone, DropzoneTemplate, MapBNAModel) {
    var mapUploadForm = FormModal.extend({
        title: 'Upload Shoreline File',
        className: 'modal form-modal upload-form',
        buttons: '<div class="btn btn-danger" data-dismiss="modal">Cancel</div>',

        events: function(){
            var formModalHash = FormModal.prototype.events;

            delete formModalHash['change input'];
            delete formModalHash['keyup input'];
            formModalHash['change input:not(tbody input)'] = 'update';
            formModalHash['keyup input:not(tbody input)'] = 'update';

            return _.defaults({}, formModalHash);
        },

        initialize: function(options){
            if (webgnome.config.can_persist) {
                this.body = _.template(UploadActivateTemplate, {page: false});
            } else {
                this.body = _.template(UploadTemplate);
            }

            FormModal.prototype.initialize.call(this, options);
        },

        render: function(){
            FormModal.prototype.render.call(this);

            this.dropzone = new Dropzone('.dropzone', {
                url: webgnome.config.api + '/map/upload',
                previewTemplate: _.template(DropzoneTemplate)(),
                paramName: 'new_map',
                maxFiles: 1,
                //acceptedFiles: '.bna',
                dictDefaultMessage: 'Drop <code>.bna</code> file here to upload (or click to navigate)'
            });
            this.dropzone.on('sending', _.bind(this.sending, this));
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('error', _.bind(this.reset, this));
            this.dropzone.on('success', _.bind(this.loaded, this));

            if (webgnome.config.can_persist) {
	            this.uploadFolder = new UploadFolder({el: $(".upload-folder")});
                this.uploadFolder.on("activate-file", _.bind(this.activateFile, this));
	            this.uploadFolder.render();
            }
        },

        sending: function(e, xhr, formData){
            formData.append('session', localStorage.getItem('session'));
            formData.append('persist_upload',
                            $('input#persist_upload')[0].checked);
        },

        progress: function(e, percent){
            if(percent === 100){
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },

        reset: function(file, err){
            console.error(err);
            setTimeout(_.bind(function(){
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }, this), 3000);
        },

        close: function(){
            this.dropzone.disable();
            $('input.dz-hidden-input').remove();
            Backbone.View.prototype.close.call(this);
        },

        loaded: function(e, response){
            var map = new MapBNAModel(JSON.parse(response));
            this.trigger('save', map);
            this.hide();
        },

        activateFile: function(filePath) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;

                $.post('/map/activate', {'file-name': filePath})
                .done(function(response){
                    thisForm.loaded(filePath, response);
                });
            }
        }
    });

    return mapUploadForm;
});
