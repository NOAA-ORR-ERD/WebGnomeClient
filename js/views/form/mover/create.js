define([
    'jquery',
    'underscore',
    'module',
    'views/modal/form',
    'views/uploads/upload_folder',
    'model/movers/cats',
    'model/movers/grid_current',
    'model/movers/py_current',
    'text!templates/form/mover/create.html',
    'text!templates/uploads/upload.html',
    'text!templates/uploads/upload_activate.html',
    'dropzone',
    'text!templates/default/dropzone.html'
], function($, _, module, FormModal, UploadFolder,
            CatsMover, GridCurrentMover, PyCurrentMover,
            CreateMoverTemplate, UploadTemplate, UploadActivateTemplate,
            Dropzone, DropzoneTemplate){
    var createMoverForm = FormModal.extend({
        className: 'modal form-modal current-form',
        title: 'Create Current Mover',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function(){
            return _.defaults({
                'click .grid': 'grid',
                'click .cats': 'cats',
                'click .py_grid': 'py_grid',
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

        nextStep: function(obj_type){
            this.$('.step1').hide();
            this.$('.step2').show();
            this.setupUpload(obj_type);
        },

        setupUpload: function(obj_type){
            this.$('#upload_form').empty();
            if (webgnome.config.can_persist) {
                this.$('#upload_form').append(_.template(UploadActivateTemplate, {page: false}));
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

        grid: function(){
            this.nextStep(GridCurrentMover.prototype.defaults.obj_type);
        },

        cats: function(){
            this.nextStep(CatsMover.prototype.defaults.obj_type);
        },

        py_grid: function(){
            this.nextStep(PyCurrentMover.prototype.defaults.obj_type);
        },

        sending: function(e, xhr, formData, obj_type){
            formData.append('session', localStorage.getItem('session'));
            formData.append('obj_type', this.obj_type);
            formData.append('persist_upload',
                            $('input#persist_upload')[0].checked);
        },

        progress: function(e, percent){
            if(percent === 100){
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
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

        close: function(){
            if(this.dropzone){
                this.dropzone.disable();
                $('input.dz-hidden-input').remove();
            }
            FormModal.prototype.close.call(this);
        },
        
        loaded: function(file, response){
            var json_response = JSON.parse(response);
            var mover;
            if (json_response && json_response.obj_type) {
                if (json_response.obj_type === GridCurrentMover.prototype.defaults.obj_type) {
                    mover = new GridCurrentMover(json_response, {parse: true});
                } else if (json_response.obj_type === CatsMover.prototype.defaults.obj_type) {
                    mover = new CatsMover(json_response, {parse: true});
                } else if (json_response.obj_type === PyCurrentMover.prototype.defaults.obj_type) {
                    mover = new PyCurrentMover(json_response, {parse: true});
                } else {
                    console.error('Mover type not recognized: ', json_response.obj_type);
                }
                this.trigger('save', mover);
            } else {
                console.error('No response to file upload');
            }
            this.hide();/*
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
            });*/
        },

        activateFile: function(filePath) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;
                
                $.post('/environment/activate', {'file-name': filePath})
                .done(function(response){
                    thisForm.loaded(filePath, response);
                });
            }
        },
    });
    return createMoverForm;
});