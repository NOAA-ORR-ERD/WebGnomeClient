define([
    'underscore',
    'module',
    'jquery',
    'backbone',
    'views/modal/form',
    'views/default/dzone',
    'model/map/bna'
], function(_, module, $, Backbone, FormModal,
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
            var max_files = 1;
            var autoProcess = true;
            if (self.obj_type === "gnome.movers.py_current_movers.PyCurrentMover") {
                max_files = 255;
                autoProcess = false;
            }
            this.obj_type = obj_type;
            this.$('#upload_form').empty();
            this.dzone = new Dzone({
                maxFiles: max_files,
                maxFilesize: webgnome.config.upload_limits.current,  // MB
                autoProcessQueue: autoProcess,
                //gnome options
                obj_type: self.obj_type,
            });
            this.$('#upload_form').append(this.dzone.$el);

            this.listenTo(this.dzone, 'upload_complete', _.bind(this.loaded, this));
        },

        loaded: function(fileList, name){
            $.post(webgnome.config.api + '/map/upload',
                {'file_list': JSON.stringify(fileList),
                 'obj_type': MapBNAModel.prototype.defaults().obj_type,
                 'name': name,
                 'session': localStorage.getItem('session')
                }
            ).done(_.bind(function(response) {
                var map = new MapBNAModel(JSON.parse(response));
                webgnome.model.save('map', map, {'validate':false});
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

                $.post('/map/activate', {'file-name': filePath})
                .done(function(response){
                    thisForm.loaded(filePath, response);
                });
            }
        }
    });

    return mapUploadForm;
});
