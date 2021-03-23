define([
    'jquery',
    'underscore',
    'module',
    'views/default/dzone',
    'text!templates/form/griddedwind.html',
    'model/movers/py_wind',
    'views/form/griddedwind_edit',
    'views/modal/form',
], function($, _, module, Dzone, GriddedWindTemplate, PyWindMover, PyWindEditForm, FormModal) {
    var griddedWindForm = FormModal.extend({
        className: 'modal form-modal griddedwind-form',
        title: 'Create Gridded Wind (Upload Only)',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function() {
            return _.defaults({
                'click .gridwind': 'gridwind',
                'click .cancel': 'close',
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
            var max_files = 255;
            var autoProcess = false;
            this.obj_type = obj_type;
            this.$('#upload_form').empty();
            this.dzone = new Dzone({
                maxFiles: max_files,
                maxFilesize: webgnome.config.upload_limits.griddedwind,  // MB
                autoProcessQueue: autoProcess,
                //gnome options
                obj_type: obj_type,
            });
            this.$('#upload_form').append(this.dzone.$el);

            this.listenTo(this.dzone, 'upload_complete', _.bind(this.loaded, this));
        },

        loaded: function(fileList) {
            $.post({
                url: webgnome.config.api + '/mover/upload',
                data: {'file_list': JSON.stringify(fileList),
                 'obj_type': this.obj_type,
                 'name': this.dzone.dropzone.files[0].name,
                 'session': localStorage.getItem('session')
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
                    if (json_response.obj_type === PyWindMover.prototype.defaults.obj_type) {
                        mover = new PyWindMover(json_response, {parse: true});
                        editform = PyWindEditForm;
                    }
                    else {
                        console.error('Mover type not recognized: ', json_response.obj_type);
                    }
                    webgnome.model.get('movers').add(mover);
                    webgnome.model.get('environment').add(mover.get('wind'));
                    
                    if (this.$('#immediate-edit')[0].checked) {
                        webgnome.model.save({},{'validate': false}).then(_.bind(function() {
                            var form = new editform(null, this);
                            form.render();
                        }, mover));
                    } else {
                        webgnome.model.save({},{'validate': false});
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

        gridwind: function() {
            this.nextStep(PyWindMover.prototype.defaults.obj_type);
        },
    });

    return griddedWindForm;
});
