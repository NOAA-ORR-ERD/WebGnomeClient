define([
    'jquery',
    'underscore',
    'backbone',
    'dropzone',
    'sweetalert',
    'model/gnome',
    'views/uploads/upload_folder',
    'text!templates/default/load.html',
    'text!templates/uploads/upload.html',
    'text!templates/uploads/upload_activate.html',
    'text!templates/default/dzone.html'
], function($, _, Backbone, Dropzone, swal,
            GnomeModel, UploadFolder,
            LoadTemplate, UploadTemplate, UploadActivateTemplate,
            DropzoneTemplate){
    'use strict';
    var loadView = Backbone.View.extend({
        className: 'page load',
        initialize: function(options){
            if(_.isUndefined(options)){ options = {}; }
            _.defaults(options, {
                simple: false,
                page: true
            });
            this.render(options);
        },

        render: function(options){
            var template;
            if (options.simple) {
                template = _.template(LoadTemplate);
            } else if (webgnome.config.can_persist) {
                template = _.template(UploadActivateTemplate);
            } else {
                template = _.template(UploadTemplate);
            }

            this.$el.html(template(options));

            if (!options.simple){
                $('body').append(this.$el);
            }

            this.dropzone = new Dropzone('.dropzone', {
                url: webgnome.config.api + '/upload',
                previewTemplate: _.template(DropzoneTemplate)(),
                paramName: 'new_model',
                maxFiles: 1,
                maxFilesize: webgnome.config.upload_limits.save, // 2GB
                acceptedFiles: '.zip, .gnome',
                timeout: 300000,
                dictDefaultMessage: 'Drop file here <br> (or click to navigate)'
            });
            this.dropzone.on('sending', _.bind(this.sending, this));
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('error', _.bind(this.reset, this));
            this.dropzone.on('success', _.bind(this.loaded, this));

            if (!options.simple && webgnome.config.can_persist) {
                this.uploadFolder = new UploadFolder({el: $(".upload-folder")});
                this.uploadFolder.on("activate-file", _.bind(this.activateFile, this));
                this.uploadFolder.render();
            }
        },

        sending: function(e, xhr, formData){
            formData.append('session', localStorage.getItem('session'));
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

        progress: function(e, percent){
            if(percent === 100){
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },

        modelHasWeatherers: function(model){
            var weatherers = model.get('weatherers');
            var weathererKeys = Object.keys(webgnome.model.model.weatherers);
            var invalidWeatherers = [];

            for (var i = weathererKeys.length - 1; i >= 0; i--){
                if (weathererKeys[i].indexOf('cleanup') !== -1 ||
                    weathererKeys[i].indexOf('beaching') !== -1 ||
                    weathererKeys[i].indexOf('weathering_data') !== -1 ||
                    weathererKeys[i].indexOf('roc') !== -1 ||
                    weathererKeys[i].indexOf('dissolution') !== -1){
                    weathererKeys.splice(i, 1);
                }
            }

            for (var j = 0; j < weathererKeys.length; j++){
                var weathererExists = weatherers.findWhere({'obj_type': weathererKeys[j]});
                if (!weathererExists){
                    invalidWeatherers.push(weathererKeys[j]);
                }
            }

            return invalidWeatherers;
        },

        modelHasOutputters: function(model){
            var outputters = model.get('outputters');
            var outputterKeys = Object.keys(webgnome.model.model.outputters);
            var invalidOutputters = [];

            for (var i = 0; i < outputterKeys.length; i++){
                var isNonStandardOutputter = webgnome.model.nonStandardOutputters.indexOf(outputterKeys[i]) > -1;
                var outputterExists = outputters.findWhere({'obj_type': outputterKeys[i]});
                if (!outputterExists && !isNonStandardOutputter){
                    invalidOutputters.push(outputterKeys[i]);
                }
            }
            
            return invalidOutputters;
        },

        removeInvalidOutputters: function(model){
            //Removes outputters that should not be in model save files (NetCDFOutput, etc)
            var outputters = model.get('outputters');
            var invalidTypes = webgnome.model.nonStandardOutputters;
            var isInvalid;
            for (var i = 0; i < outputters.models.length; i++) {
                isInvalid = $.inArray(outputters.models[i].get('obj_type'), invalidTypes);
                if(isInvalid !== -1) {
                    outputters.remove(outputters.models[i].get('id'));
                }
            }
        },

        loaded: function(fileobj, resp){
            if (resp === 'UPDATED_MODEL'){
                
                swal({
                    title: 'Old Save File Detected',
                    text: 'Compatibility changes may hae been made. It is HIGHLY recommended to verify and re-save the model after loading',
                    type: 'warning',
                    closeOnConfirm: true,
                    confirmButtonText: 'Ok'
                });
            }
            webgnome.model = new GnomeModel();
            webgnome.model.fetch({
                success: _.bind(function(model, response, options){
                    model.setupTides();
                    var map = model.get('map');
                    var spills = model.get('spills').models;

                    var locationExists = (map.get('map_bounds')[0][0] !== -360) && (map.get('map_bounds')[0][1] !== 90);
                    var invalidSpills = [];
                    /* JAH: Removed this because I don't think it's relevant anymore
                    and shouldn't be handled here anyway
                    for (var i = 0; i < spills.length; i++){

                        if (model.get('mode') === 'adios') {
                            spills[i].get('release').durationShift(model.get('start_time'));
                            //invalidSpills.push(spills[i].get('name'));
                        } else if (spills[i].get('release').get('end_position')[0] === 0 && spills[i].get('release').get('end_position')[1] === 0) {
                            if (spills[i].get('release').get('start_position')[0] === 0 && spills[i].get('release').get('start_position')[1] === 0) {
                            }
                            else {
                                var start_position = spills[i].get('release').get('start_position');
                                spills[i].get('release').set('end_position', start_position);
                                invalidSpills.push(spills[i].get('name'));
                            }
                        }

                        if (_.isNull(spills[i].get('release').get('end_release_time'))){
                            var start_time = spills[i].get('release').get('release_time');
                            spills[i].get('release').set('end_release_time', start_time);
                        }
                    }
                    */

                    var neededModels = this.modelHasWeatherers(model).concat(this.modelHasOutputters(model));

                    var neededModelsStr = '';
                    var invalidSpillsStr = '';

                    for (var s = 0; s < neededModels.length; s++){
                        neededModelsStr += neededModels[s] + '\n';
                    }

                    for (var j = 0; j < invalidSpills.length; j++){
                        invalidSpillsStr += invalidSpills[j] + '\n';
                    }

                    var msg = '';
                    this.removeInvalidOutputters(model);

                    if (neededModels.length > 0 || invalidSpills.length > 0){
                        if (neededModels.length > 0){
                            msg += 'The components listed below will be added to the model.<br /><br /><code>' + neededModelsStr + '</code><br />';
                        }
                        if (invalidSpills.length > 0){
                            msg += 'The following spill(s) were altered to be compatible.<br /><br /><code>' + invalidSpillsStr + '</code><br />';
                        }
                        swal({
                            title: 'Save File Compliance',
                            text: 'Some components of the Save File are not supported or are missing.' + msg,
                            type: 'warning',
                            closeOnConfirm: true,
                            confirmButtonText: 'Ok'
                        }).then(function(isConfirm){
                            if (isConfirm){
                                for (var i = 0; i < neededModels.length; i++){
                                    if (neededModels[i].indexOf('outputters') !== -1){
                                        var outputterModel = new webgnome.model.model.outputters[neededModels[i]]();
                                        webgnome.model.get('outputters').add(outputterModel);
                                    } else if (neededModels[i].indexOf('weatherers') !== -1){
                                        var weathererModel = new webgnome.model.model.weatherers[neededModels[i]]({on: false});
                                        webgnome.model.get('weatherers').add(weathererModel);
                                    }
                                }
                                var water = model.get('environment').findWhere({'obj_type': 'gnome.environment.water.Water'});
                                var wind = model.get('environment').findWhere({'obj_type': 'gnome.environment.wind.Wind'});

                                webgnome.model.save(null, {validate: false,
                                    success: function() {
                                        webgnome.router.navigate('config', true);
                                    }
                                });
                                webgnome.router._cleanup();

                            }
                        });
                    } else {
                        webgnome.router._cleanup();
                        webgnome.router.navigate('config', true);
                    }
                }, this)
            });
        },

        activateFile: function(filePath) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;

                $.post('/activate', {'file-name': filePath})
                .done(function(response){
                    thisForm.loaded(filePath, response);
                });
            }
        },

        close: function(){
            this.dropzone.disable();
            $('input.dz-hidden-input').remove();
            Backbone.View.prototype.close.call(this);
        }
    });

    return loadView;
});
