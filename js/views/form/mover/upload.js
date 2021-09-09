define([
    'underscore',
    'module',
    'jquery',
    'backbone',
    'views/modal/form',
    'text!templates/form/mover/upload.html',
    'model/movers/cats',
    'model/movers/grid_current',
    'model/movers/py_current',
    'model/movers/py_wind',
    'views/form/mover/cats',
    'views/form/mover/grid_current',
    'views/form/mover/py_wind',
    'views/default/dzone',
    'model/map/bna'
], function(_, module, $, Backbone, FormModal, MoverUploadFormTemplate,
            CatsMover, GridCurrentMover, PyCurrentMover, PyWindMover,
            CatsMoverForm, PyCurrentMoverForm, PyWindMoverForm,
            Dzone, MapBNAModel) {
    var mapUploadForm = FormModal.extend({
        title: 'Upload Current File',
        className: 'modal form-modal upload-form',
        buttons: '<div class="btn btn-danger" data-dismiss="modal">Cancel</div>',

        events: function(){
            return _.defaults({
                'click .cancel': 'close',
                'click .save': 'proceed'
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            this.obj_type = options.obj_type;
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(){
            this.body = _.template(MoverUploadFormTemplate)();
            FormModal.prototype.render.call(this);

            var max_files = 1;
            var autoProcess = true;
            if (this.obj_type === "gnome.movers.py_current_movers.PyCurrentMover" ||
                this.obj_type === "gnome.movers.py_wind_movers.PyWindMover") {
                max_files = 255;
                autoProcess = false;
            }
            this.$('#upload_form').empty();
            this.dzone = new Dzone({
                maxFiles: max_files,
                maxFilesize: webgnome.config.upload_limits.current,  // MB
                autoProcessQueue: autoProcess,
                //gnome options
                obj_type: this.obj_type,
            });
            this.$('#upload_form').append(this.dzone.$el);

            this.listenTo(this.dzone, 'upload_complete', _.bind(this.loaded, this));
        },

        proceed: function() {
            this.dzone.options.autoProcessQueue = true;
            this.dzone.dropzone.processQueue();
        },

        loaded: function(fileList, name){
            $.post({
                url: webgnome.config.api + '/mover/upload',
                data: {'file_list': JSON.stringify(fileList),
                    'obj_type': this.obj_type,
                    'name': name,
                    'session': localStorage.getItem('session'),
                    'tshift': this.$('#adjust_tz').val(),
                },
                crossDomain: true,
                dataType: 'json',
                //contentType: 'application/json',
                xhrFields: {
                    withCredentials: true
                },
            })
            .done(_.bind(function(json_response) {
                var mover, editform;

                if (json_response && json_response.obj_type) {

                    if (json_response.obj_type === GridCurrentMover.prototype.defaults().obj_type) {
                        mover = new GridCurrentMover(json_response, {parse: true});
                        editform = PyCurrentMoverForm; //'New' form should still be compatible with old Mover
                    }
                    else if (json_response.obj_type === CatsMover.prototype.defaults().obj_type) {
                        mover = new CatsMover(json_response, {parse: true});
                        this.$('#immediate-edit').prop('checked', true);
                        editform = CatsMoverForm;
                    }
                    else if (json_response.obj_type === PyCurrentMover.prototype.defaults.obj_type) {
                        mover = new PyCurrentMover(json_response, {parse: true});
                        editform = PyCurrentMoverForm;
                    }
                    else if (json_response.obj_type === PyWindMover.prototype.defaults.obj_type) {
                        mover = new PyWindMover(json_response, {parse: true});
                        editform = PyWindMoverForm;
                    }
                    else {
                        console.error('Mover type not recognized: ', json_response.obj_type);
                    }

                    if (this.$('#immediate-edit')[0].checked) {
                            var form = new editform(null, mover);
                            form.on('hidden', form.close);
                            form.on('save', _.bind(function(){
                                webgnome.model.get('movers').add(mover);
                                if (mover.get('obj_type') === 'gnome.movers.py_current_movers.PyCurrentMover') {
                                    webgnome.model.get('environment').add(mover.get('current'));
                                }
                                if (mover.get('obj_type') === 'gnome.movers.py_wind_movers.PyWindMover') {
                                    webgnome.model.get('environment').add(mover.get('wind'));
                                }
                                webgnome.model.save();
                            }, this));
                            form.render();  
                    } else {
                        webgnome.model.get('movers').add(mover);
                        if (mover.get('obj_type') === 'gnome.movers.py_current_movers.PyCurrentMover') {
                            webgnome.model.get('environment').add(mover.get('current'));
                        }
                        if (mover.get('obj_type') === 'gnome.movers.py_wind_movers.PyWindMover') {
                            webgnome.model.get('environment').add(mover.get('wind'));
                        }
                        webgnome.model.save();
                    }
                }
                else {
                    console.error('No response to file upload');
                }
                this.hide();
            }, this)).fail(
                _.bind(this.dzone.reset, this.dzone)
            );
        },

        close: function() {
            if (this.dzone) {
                this.dzone.close();
            }

            FormModal.prototype.close.call(this);
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

    return mapUploadForm;
});
