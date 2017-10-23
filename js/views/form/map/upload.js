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
    'model/map/bna'
], function(_, $, Backbone, FormModal,
            UploadTemplate, UploadActivateTemplate, FileItemTemplate,
            Dropzone, DropzoneTemplate, MapBNAModel){
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
                'click .open-folder': 'useUploadFolder'
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
            formThis = this;
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

            $('.nav-tabs a[href="#use_uploaded"]').on('shown.bs.tab', function (e) {
                var target_ref = $(e.target).attr("href"); // activated tab
                var target = $(target_ref).find('tbody#file_list').empty();

                formThis.renderFileList(target, []);
            });
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

        renderFileList: function(target, sub_folders) {
            upload_path = $(['/uploads'].concat(sub_folders)).get().join('/');
            console.log('renderFileList(): target = ' + target + ', path = ' + upload_path);


            $.get(upload_path).done(function(result){
                var fileItemTemplate = _.template(FileItemTemplate);

                function fileSize(bytes) {
                    var exp = Math.log(bytes) / Math.log(1024) | 0;
                    var result = (bytes / Math.pow(1024, exp)).toFixed(2);

                    return result + ' ' + (exp == 0 ? 'bytes': 'KMGTPEZY'[exp - 1] + 'B');
                }

                $.each(result, function (index, file) {
                    $(target).append(fileItemTemplate({'file': file,
                    	                                  'fileSize': fileSize,
                                                       }));
                });
            });
        },

        useUploadedFile: function(e) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;
                var parentRow = this.$(e.target).parents('tr')[0];                
                var fileName = parentRow.cells[0].innerText

                $.post('/map/activate', {'file-name': fileName})
                .done(function(response){
                    thisForm.loaded(e, response);
                });
            }
        },

        useUploadFolder: function(e) {

            if (this.$('.popover').length === 0) {
                var thisForm = this;
                var parentRow = this.$(e.target).parents('tr')[0];                
                var folderName = parentRow.cells[0].innerText;

                breadcrumbs = thisForm.$('.breadcrumb');
                breadcrumbs.append($('<li>').append(folderName));

                sub_folders = breadcrumbs.find('li')
                              .map(function (idx, item) {
                                  return item.innerText;
                              }).slice(1).toArray();
                console.log('Use the upload folders: ' + sub_folders);

                var target = $(thisForm).find('tbody#file_list').empty();

                thisForm.renderFileList(target, sub_folders);
                }
        },
    });

    return mapUploadForm;
});
