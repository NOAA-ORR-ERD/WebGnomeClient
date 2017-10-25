define([
    'underscore',
    'jquery',
    'backbone',
    'views/modal/form',
    'text!templates/default/upload.html',
    'text!templates/default/upload_activate.html',
    'text!templates/default/uploaded_file.html',
    'dropzone',
    'text!templates/default/dropzone.html',
    'model/map/bna',
    'model/uploads/upload_folder'
], function(_, $, Backbone, FormModal,
            UploadTemplate, UploadActivateTemplate, FileItemTemplate,
            Dropzone, DropzoneTemplate, MapBNAModel, UploadFolder) {
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

            return _.defaults({
                'click .open-file': 'useUploadedFile',
                'click .open-folder': 'openFolder',
                'click .breadcrumb li': 'useBreadcrumbFolder'
            }, formModalHash);
        },

        initialize: function(options){
            if (webgnome.config.can_persist) {
                this.body = _.template(UploadActivateTemplate);
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

            this.dropzone.on('error', _.bind(this.reset, this));
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('success', _.bind(this.loaded, this));
            this.dropzone.on('sending', _.bind(this.sending, this));

            if (webgnome.config.can_persist) {
	            this.uploadFolder = new UploadFolder();
	            this.uploadFolder.bind("reset", _.bind(this.renderFileList, this));
	            this.uploadFolder.fetch({reset: true});
            }
        },

        sending: function(e, xhr, formData){
            formData.append('session', localStorage.getItem('session'));
            formData.append('persist_upload',
                            $('input#persist_upload')[0].checked);
        },

        reset: function(file){
            setTimeout(_.bind(function(){
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }, this), 10000);
        },

        progress: function(e, percent){
            if(percent === 100){
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },

        loaded: function(e, response){
            var map = new MapBNAModel(JSON.parse(response));
            this.trigger('save', map);
            this.hide();
        },

        close: function(){
            this.dropzone.disable();
            $('input.dz-hidden-input').remove();
            Backbone.View.prototype.close.call(this);
        },

        renderFileList: function(uploadFolder) {
            var fileList = this.$('tbody#file_list').empty();
            var fileItemTemplate = _.template(FileItemTemplate);

            function fileSize(bytes) {
                var exp = Math.log(bytes) / Math.log(1024) | 0;
                var result = (bytes / Math.pow(1024, exp)).toFixed(2);

                return result + ' ' + (exp === 0 ? 'bytes': 'KMGTPEZY'[exp - 1] + 'B');
            }

            uploadFolder.each(function (file, index) {
                $(fileList).append(fileItemTemplate({'file': file.toJSON(),
                                                     'fileSize': fileSize,
                                                     }));
            });

            var breadcrumbs = this.$('.breadcrumb').empty();
            breadcrumbs.append($('<li>').append('uploads'));

            $(uploadFolder.subFolders).each(function (index, folder) {
                breadcrumbs.append($('<li>').append(folder));
            });
        },

        useUploadedFile: function(e) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;
                var parentRow = this.$(e.target).parents('tr')[0];                
                var fileName = parentRow.cells[0].innerText;
                var filePath = this.uploadFolder.subFolders.concat(fileName).join('/');

                $.post('/map/activate', {'file-name': filePath})
                .done(function(response){
                    thisForm.loaded(e, response);
                });
            }
        },

        openFolder: function(e) {
            if (this.$('.popover').length === 0) {
                var parentRow = this.$(e.target).parents('tr')[0];                
                var folderName = parentRow.cells[0].innerText;

                var breadcrumbs = this.$('.breadcrumb');
                breadcrumbs.append($('<li>').append(folderName));

                this.uploadFolder.subFolders.push(folderName);                
                this.uploadFolder.fetch({reset: true});
            }
        },

        useBreadcrumbFolder: function(e) {
            if (this.$('.popover').length === 0) {
                this.uploadFolder.subFolders.length = $(e.target).index();
                this.uploadFolder.fetch({reset: true});
            }
        }

    });

    return mapUploadForm;
});
