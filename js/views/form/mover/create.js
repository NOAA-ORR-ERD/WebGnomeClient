define([
    'underscore',
    'jquery',
    'module',
    'views/modal/form',
    'model/movers/cats',
    'model/movers/grid_current',
    'model/environment/env_objs',
    'text!templates/form/mover/create.html',
    'dropzone',
    'text!templates/default/dropzone.html'
], function(_, $, module, FormModal, CatsMover, PyCurrentMover, GridCurrentModel, CreateMoverTemplate, Dropzone, DropzoneTemplate){
    var createMoverForm = FormModal.extend({
        className: 'modal form-modal current-form',
        title: 'Create Current Mover',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',
                
        events: function(){
            return _.defaults({
                'click .grid': 'grid',
                'click .cats': 'cats',
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
        },

        grid: function(){
            this.model = new PyCurrentMover();
            this.nextStep();
        },

        cats: function(){
            this.model = new CatsMover();
            this.nextStep();
        },

        sending: function(e, xhr, formData){
            formData.append('session', localStorage.getItem('session'));
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
            this.model.set('name', json_response.filename.split('/').pop());
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