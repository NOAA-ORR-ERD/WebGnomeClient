define([
    'backbone',
    'jquery',
    'underscore',
    'module',
    'dropzone',
    'text!templates/default/dzone.html',
    'text!templates/form/mover/cats.html',
    'views/modal/form',
    'model/environment/tide'
], function(Backbone, $, _, module, Dropzone, DropzoneTemplate, FormTemplate, FormModal, TideModel) {
    'use strict';                
    var catsForm = FormModal.extend({
            
        className: 'modal form-modal model-form',
        title: 'CATS Mover',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
        initialize: function(options, model){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = model;
        },


        events: function() {
            return _.defaults({
                'click .new-tide': 'newTide',
                'change #scale': 'scaleHandler',
                'change #tide': 'tideHandler'
            }, FormModal.prototype.events);
        },

        render: function(options) {
            this.body = this.template();
            FormModal.prototype.render.call(this, options);
            var sv = this.$('#scale_value');
            var srf = this.$('#scale_refpoint');
            var tide = this.$('#tide');
            if (this.model.get('scale')) {
                sv.prop('disabled', false);
                srf.parent().children().prop('disabled', false);
            }
            if (_.isUndefined(this.model.get('tide')) || this.model.get('tide') === null) {
                tide[0].value = 'null';
            }
        },

        template: function() {
            return _.template(FormTemplate, {
                model: this.model,
                tides: webgnome.model.getTides()
            });
        },

        scaleHandler: function(e) {
            var sv = this.$('#scale_value');
            var srf = this.$('#scale_refpoint');
            var tide = this.$('#tide');
            if (e.currentTarget.value === 'true') {
                sv.prop('disabled', false);
                srf.parent().children().prop('disabled', false);
            } else {
                this.disableScaling();
            }
        },

        disableScaling: function() {
            var s = this.$('#scale');
            var sv = this.$('#scale_value');
            var srf = this.$('#scale_refpoint');
            var tide = this.$('#tide');

            sv.prop('disabled', true);
            srf[0].value = '';
            this.model.set('scale', false);
            s[0].value = 'false';
            this.model.set('scale_refpoint', [-0.000999,-0.000999,-0.000999]);
            this.model.set('scale_value', 1);
            sv[0].value = 1; 
            srf.parent().children().prop('disabled', true);
            tide[0].value = 'null';
            this.model.set('tide', null);
            this.$('#scale_value_label')[0].innerText ='Reference point value in m/s:';
        },

        tideHandler: function(e) {
            var s = this.$('#scale');
            var sv = this.$('#scale_value');
            var srf = this.$('#scale_refpoint');
            if (e.currentTarget.value !== 'null'){
                var tide = webgnome.obj_ref[e.currentTarget.value];
                this.model.set('tide', tide);
                this.model.set('scale', true);
                webgnome.model.save(null, {
                    success: _.bind(function(mod){
                        this.model.save(null, {
                            success: _.bind(function(mod){
                                this.render();
                            }, this)
                        });
                    }, this)
                });
                if (this.dropzone){
                    this.dropzone.removeAllFiles(true);
                    this.dropzone.disable();
                }
                this.$el.html('');
            } else {
                this.disableScaling();
            }
        },

        newTide: function() {
            this.$('.tide-upload').removeClass('hidden');

            this.dropzone = new Dropzone('.tide-upload', {
                url: webgnome.config.api + '/environment/upload',
                previewTemplate: _.template(DropzoneTemplate)(),
                paramName: 'new_environment',
                maxFiles: 1,
                maxFilesize: webgnome.config.upload_limits.current, // 2GB
                acceptedFiles: '.cur, .txt',
                timeout: 300000,
                dictDefaultMessage: 'Drop file here to add (or click to navigate).<br> Click the help icon for details on supported file formats.',
            });

            this.dropzone.on('sending', _.bind(this.sending, this));
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('error', _.bind(this.reset, this));
            this.dropzone.on('success', _.bind(this.loaded, this));
        },

        sending: function(e, xhr, formData, obj_type) {
            formData.append('session', localStorage.getItem('session'));
            formData.append('obj_type', this.obj_type);
        },

        progress: function(e, percent) {
            if (percent === 100) {
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },

        reset: function(file, err) {
            var errObj = JSON.parse(err);
            console.error(errObj);

            this.$('.dz-error-message span')[0].innerHTML = (errObj.exc_type +
                                                             ': ' +
                                                             errObj.message);

            setTimeout(_.bind(function() {
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }, this), 3000);
        },

        loaded: function(e, response) {
            var tide = new TideModel(JSON.parse(response), {parse: true});

            tide.save(null, {
                success: _.bind(function() {
                    webgnome.model.get('environment').add(tide);
                    this.model.set('tide', tide);
                    this.model.set('scale', true);
                    webgnome.model.save(null, {
                        success: _.bind(function(mod){
                            this.model.save(null, {
                                success: _.bind(function(mod){
                                    this.render();
                                }, this)
                            });
                        }, this)
                    });
                    this.dropzone.removeAllFiles(true);
                    this.dropzone.disable();
                    this.$el.html('');
                }, this),
                error: _.bind(function(e, response) {
                    this.error(response.responseText);
                    this.dropzone.removeAllFiles(true);
                }, this)
            });
        },

        save: function() {
            var scaling_on = this.model.get('scale');
            if (scaling_on === 'false'){
                this.model.set('scale', false);
                scaling_on = false;
            }
            if (scaling_on) {
                var srf = this.$('#scale_refpoint');
                if (srf[0].value === '') {
                    this.error('Error! Need to set a scale reference point');
                } else {
                    FormModal.prototype.save.call(this);
                }
            } else {
                FormModal.prototype.save.call(this);
            }
            if (!scaling_on) {
                // because scale_refpoint needs to be set to a special value to 'unset' it on the server
                this.model.unset('scale_refpoint');
            }
        },

        close: function() {
            if (this.dropzone) {
                this.dropzone.disable();
                $('input.dz-hidden-input').remove();    
            }

            FormModal.prototype.close.call(this);
        }
    });

    return catsForm;
});
