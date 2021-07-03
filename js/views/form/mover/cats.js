define([
    'backbone',
    'jquery',
    'underscore',
    'module',
    'views/default/dzone',
    'text!templates/form/mover/cats.html',
    'views/modal/form',
    'model/environment/tide',
    'views/modal/pick-coords'
], function(Backbone, $, _, module, Dzone, FormTemplate, FormModal, TideModel, PickCoordsView) {
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
                'change #tide': 'tideHandler',
                'click .pick-coords': 'pickCoords'
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
            return _.template(FormTemplate)({
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
                this.$el.html('');
            } else {
                this.disableScaling();
            }
        },

        newTide: function() {
            if (this.$('.tide-upload').hasClass('hidden')) {
                this.$('.tide-upload').removeClass('hidden');

                this.dzone = new Dzone({
                    maxFiles: 1,
                    maxFilesize: webgnome.config.upload_limits.current, // 2GB
                    acceptedFiles: '.cur, .txt',
                    autoProcessQueue:true,
                    dictDefaultMessage: 'Drop file here to add (or click to navigate).<br> Click the help icon for details on supported file formats.',
                });
                this.$('.tide-upload').append(this.dzone.$el);
                this.listenTo(this.dzone, 'upload_complete', _.bind(this.loaded, this));
            }
        },

        loaded: function(fileList, name){
            $.post(webgnome.config.api + '/environment/upload',
                {'file_list': JSON.stringify(fileList),
                 'obj_type': TideModel.prototype.defaults().obj_type,
                 'name': name,
                 'session': localStorage.getItem('session')
                }
            ).done(_.bind(function(response) {
                var tide = new TideModel(JSON.parse(response), {parse: true});
                webgnome.model.get('environment').add(tide);
                webgnome.model.save(null, {
                    success: _.bind(function(mod){
                        this.model.set('tide', tide);
                        this.model.set('scale', true);
                        this.model.save(null, {
                            success: _.bind(function(mod){
                                this.render();
                            }, this)
                        });
                    }, this)
                });
                this.$el.html('');
            }, this)).fail(
                _.bind(this.dzone.reset, this.dzone)
            );
        },

        pickCoords: function(e) {
            var modal = new PickCoordsView({
                target: this.$($(e.currentTarget).data('el')),
                type: 'cesium',
                model: _.has(this, 'model') ? this.model : null
            });

            modal.render();
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
            if (this.dzone) {
                this.dzone.close();
            }

            FormModal.prototype.close.call(this);
        }
    });

    return catsForm;
});
