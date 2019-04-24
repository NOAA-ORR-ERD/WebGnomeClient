define([
    'jquery',
    'underscore',
    'module',
    'views/modal/form',
    'views/uploads/upload_folder',
    'model/movers/cats',
    'views/form/mover/cats',
    'model/movers/grid_current',
    'model/movers/py_current',
    'text!templates/form/mover/create.html',
    'text!templates/uploads/upload.html',
    'text!templates/uploads/upload_activate.html',
    'dropzone',
    'text!templates/default/dropzone.html',
    'views/default/dzone',
], function($, _, module, FormModal, UploadFolder,
            CatsMover, CatsMoverForm, GridCurrentMover, PyCurrentMover,
            CreateMoverTemplate, UploadTemplate, UploadActivateTemplate,
            Dropzone, DropzoneTemplate, Dzone) {
    var createMoverForm = FormModal.extend({
        className: 'modal form-modal current-form',
        title: 'Create Current Mover',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function() {
            return _.defaults({
                'click .grid': 'grid',
                'click .cats': 'cats',
                'click .py_grid': 'py_grid',
            }, FormModal.prototype.events);
        },

        initialize: function(options) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);

            this.listenTo(this, 'hide', this.close);
            this.body = _.template(CreateMoverTemplate);
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
            this.obj_type = obj_type;
            this.$('#upload_form').empty();
            this.dzone = new Dzone({
                previewTemplate: _.template(DropzoneTemplate)(),
                maxFiles: 255,
                maxFilesize: webgnome.config.upload_limits.current,  // MB
                //autoProcessQueue: false,
                dictDefaultMessage: 'Drop file here to upload (or click to navigate).\n Alternatively, drop filelist.txt for enforced file ordering',
                //gnome options
                obj_type: obj_type,
            });
            this.$('#upload_form').append(this.dzone.$el);

            this.listenTo(this.dzone, 'upload_complete', _.bind(this.loaded, this));
        },

        grid: function() {
            this.nextStep(GridCurrentMover.prototype.defaults().obj_type);
        },

        cats: function() {
            this.nextStep(CatsMover.prototype.defaults().obj_type);
        },

        py_grid: function() {
            this.nextStep(PyCurrentMover.prototype.defaults.obj_type);
        },

        close: function() {
            if (this.dropzone) {
                this.dropzone.disable();
                $('input.dz-hidden-input').remove();
            }

            FormModal.prototype.close.call(this);
        },

        loaded: function(fileList) {
            this.$.post(webgnome.config.api + '/mover/upload',
                {'file_list': JSON.stringify(fileList),
                 'obj_type': this.obj_type,
                 'name': this.dzone.dropzone.files[0].name,
                }
            )
            .done(_.bind(function(response) {
                var json_response = JSON.parse(response);
                var mover;

                if (json_response && json_response.obj_type) {
                    if (json_response.obj_type === GridCurrentMover.prototype.defaults().obj_type) {
                        mover = new GridCurrentMover(json_response, {parse: true});
                    }
                    else if (json_response.obj_type === CatsMover.prototype.defaults().obj_type) {
                        mover = new CatsMover(json_response, {parse: true});
                    }
                    else if (json_response.obj_type === PyCurrentMover.prototype.defaults.obj_type) {
                        mover = new PyCurrentMover(json_response, {parse: true});
                    }
                    else {
                        console.error('Mover type not recognized: ', json_response.obj_type);
                    }
                    console.log(mover);
                    webgnome.model.get('movers').add(mover);

                    if (mover.get('obj_type') === 'gnome.movers.py_current_movers.PyCurrentMover') {
                        webgnome.model.get('environment').add(mover.get('current'));
                    }

                    webgnome.model.save(null, {validate: false}).then(_.bind(function() {
                        if (mover.get('obj_type') === 'gnome.movers.current_movers.CatsMover') {
                            var form = new CatsMoverForm(null, mov);

                            form.on('save', function() {
                                form.on('hidden', form.close);
                            });

                            form.on('wizardclose', form.close);

                            form.render();    
                        }
                    }, this));
                }
                else {
                    console.error('No response to file upload');
                }

                this.hide();
            }, this));
            //this.trigger('save');
        },

        activateFile: function(filePath) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;

                $.post('/environment/activate', {'file-name': filePath})
                 .done(function(response) {
                    thisForm.loaded(filePath, response);
                });
            }
        },
    });

    return createMoverForm;
});
