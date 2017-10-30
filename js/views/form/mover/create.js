define([
    'underscore',
    'jquery',
    'module',
    'views/modal/form',
    'model/movers/cats',
    'model/movers/grid_current',
    'model/movers/py_current',
    'model/uploads/upload_folder',
    'text!templates/form/mover/create.html',
    'text!templates/uploads/upload.html',
    'text!templates/uploads/upload_activate.html',
    'text!templates/uploads/uploaded_file.html',
    'dropzone',
    'text!templates/default/dropzone.html'
], function(_, $, module, FormModal,
            CatsMover, GridCurrentMover, PyCurrentMover, UploadFolder,
            CreateMoverTemplate, UploadTemplate, UploadActivateTemplate,
            FileItemTemplate, Dropzone, DropzoneTemplate){
    var createMoverForm = FormModal.extend({
        className: 'modal form-modal current-form',
        title: 'Create Current Mover',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function(){
            return _.defaults({
                'click .grid': 'grid',
                'click .cats': 'cats',
                'click .py_grid': 'py_grid',
                'click .open-file': 'useUploadedFile',
                'click .open-folder': 'openFolder',
                'click .breadcrumb li': 'useBreadcrumbFolder'
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.body = _.template(CreateMoverTemplate);
        },

        render: function(){
            FormModal.prototype.render.call(this);
            this.$('.step2').hide();
        },

        nextStep: function(){
            this.$('.step1').hide();
            this.$('.step2').show();
            this.setupUpload();
        },

        setupUpload: function(){
            this.$('#upload_form').empty();
            if (webgnome.config.can_persist) {
                this.$('#upload_form').append(_.template(UploadActivateTemplate));
            } else {
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

        renderFileList: function(uploadFolder) {
            var fileList = this.$('tbody#file_list').empty();
            var fileItemTemplate = _.template(FileItemTemplate);

            uploadFolder.each(function (file, index) {
                $(fileList).append(fileItemTemplate({'file': file}));
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

                $.post('/environment/activate', {'file-name': filePath})
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
        },

        grid: function(){
            this.model = new GridCurrentMover();
            this.nextStep();
        },

        cats: function(){
            this.model = new CatsMover();
            this.nextStep();
        },

        py_grid: function(){
            this.model = new PyCurrentMover();
            this.nextStep();
        },

        sending: function(e, xhr, formData){
            formData.append('session', localStorage.getItem('session'));
            formData.append('persist_upload',
                            $('input#persist_upload')[0].checked);
        },

        reset: function(file, immediate){
            if(immediate){
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            } else {
                setTimeout(_.bind(function(){
                    this.$('.dropzone').removeClass('dz-started');
                    this.dropzone.removeFile(file);
                }, this), 10000);
            }
        },

        progress: function(e, percent){
            if(percent === 100){
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },

        loaded: function(file, response){
            var json_response = JSON.parse(response);
            this.model.set('filename', json_response.filename);
            this.model.set('name', json_response.name);

            if (this.model.get('obj_type') === 'gnome.movers.py_current_movers.PyCurrentMover') {
                // Must include a 'current' otherwise the API will not add it
                // and later on the current object referenced by environment
                // obj collection will disassociate from the one referenced
                // by this mover
                this.model.set('current', {data_file: json_response.filename,
                                           grid_file: json_response.filename,
                                           obj_type: 'gnome.environment.environment_objects.GridCurrent'
                                           });
            }

            this.model.save(null, {
                success: _.bind(function(){
                    this.trigger('save', this.model);
                    this.hide();
                }, this),
                error: _.bind(function(model, e){
                    this.error(e.responseText);
                    this.reset(file, true);
                }, this)
            });
        },

        close: function(){
            if(this.dropzone){
                this.dropzone.disable();
                $('input.dz-hidden-input').remove();
            }
            FormModal.prototype.close.call(this);
        }
    });
    return createMoverForm;
});