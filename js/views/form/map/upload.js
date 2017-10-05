define([
    'underscore',
    'jquery',
    'backbone',
    'views/modal/form',
    'text!templates/form/map/upload.html',
    'text!templates/default/uploaded_file.html',
    'dropzone',
    'text!templates/default/dropzone.html',
    'model/map/bna'
], function(_, $, Backbone, FormModal, UploadTemplate, FileItemTemplate,
            Dropzone, DropzoneTemplate, MapBNAModel){
    var mapUploadForm = FormModal.extend({
        title: 'Upload Shoreline File',
        className: 'modal form-modal upload-form',
        buttons: '<div class="btn btn-danger" data-dismiss="modal">Cancel</div>',

        initialize: function(options){
            this.body = _.template(UploadTemplate);
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

            $('.nav-tabs a[href="#use_uploaded"]').on('shown.bs.tab', function (e) {
                var target_ref = $(e.target).attr("href"); // activated tab
                var target = $(target_ref).find('tbody#file_list').empty();

                $.get('/uploaded').done(function(result){
                    console.log('result: ', result);
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
        }
    });

    return mapUploadForm;
});