define([
    'jquery',
    'underscore',
    'backbone',
    'dropzone',
    'sweetalert',
    'model/gnome',
    'text!templates/default/load.html',
    'text!templates/default/dropzone.html'
], function($, _, Backbone, Dropzone, swal, GnomeModel, LoadTemplate, DropzoneTemplate){
    'use strict';
    var loadView = Backbone.View.extend({
        className: 'page load',
        initialize: function(){

            this.render();
        },

        render: function(){
            var template = _.template(LoadTemplate);

            this.$el.html(template);

            $('body').append(this.$el);

            this.dropzone = new Dropzone('.dropzone', {
                url: webgnome.config.api + '/upload',
                previewTemplate: _.template(DropzoneTemplate)(),
                paramName: 'new_model',
                maxFiles: 1,
                acceptedFiles: '.zip',
                dictDefaultMessage: 'Drop model zip file here to load (or click to navigate)'
            });
            this.dropzone.on('error', _.bind(this.reset, this));
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('success', _.bind(this.loaded, this));
            this.dropzone.on('sending', _.bind(this.sending, this));
        },

        sending: function(e, xhr, formData){
            formData.append('session', localStorage.getItem('session'));
        },

        reset: function(file){
            setTimeout(_.bind(function(){
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }, this), 2000);
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
                if (weathererKeys[i].indexOf('cleanup') !== -1 || weathererKeys[i].indexOf('beaching') !== -1){
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
                var outputterExists = outputters.findWhere({'obj_type': outputterKeys[i]});
                if (!outputterExists){
                    invalidOutputters.push(outputterKeys[i]);
                }
            }
            
            return invalidOutputters;
        },

        loaded: function(){
            webgnome.model = new GnomeModel();
            webgnome.model.fetch({
                success: _.bind(function(model, response, options){
                    var map = model.get('map');
                    var spills = model.get('spills').models;
                    var water = model.get('environment').findWhere({'obj_type': 'gnome.environment.environment.Water'});

                    var locationExists = (map.get('map_bounds')[0][0] !== -360) && (map.get('map_bounds')[0][1] !== 90);
                    var spillGeo = true;
                    var invalidSpills = [];
                    for (var i = 0; i < spills.length; i++){
                        if (spills[i].get('release').get('start_position')[0] === 0 && spills[i].get('release').get('start_position')[1] === 0){
                            spillGeo = false;
                            break;
                        }

                        if (spills[i].get('release').get('end_position')[0] === 0 && spills[i].get('release').get('end_position')[1] === 0){
                            var start_position = spills[i].get('release').get('start_position');
                            spills[i].get('release').set('end_position', start_position);
                            invalidSpills.push(spills[i].get('name'));
                        }

                        if (_.isNull(spills[i].get('release').get('end_release_time'))){
                            var start_time = spills[i].get('release').get('release_time');
                            spills[i].get('release').set('end_release_time', start_time);
                        }
                    }
                    if (!locationExists && !spillGeo){
                        localStorage.setItem('prediction', 'fate');
                    } else if (_.isUndefined(water) && locationExists){
                        localStorage.setItem('prediction', 'trajectory');
                    } else {
                        localStorage.setItem('prediction', 'both');
                    }

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

                    if (neededModels.length > 0 || invalidSpills.length > 0){
                        if (neededModels.length > 0){
                            msg += 'The models listed below will be added to the model.<br /><br /><code>' + neededModelsStr + '</code><br />';
                        }
                        if (invalidSpills.length > 0){
                            msg += 'The following spill models were altered to be compatible.<br /><br /><code>' + invalidSpillsStr + '</code><br />';
                        }
                        swal({
                            html: true,
                            title: 'Model Compliance',
                            text: 'The model you loaded is not compliant with the web environment.' + msg,
                            type: 'warning',
                            closeOnConfirm: true,
                            confirmButtonText: 'Ok'
                        }, function(isConfirm){
                            if (isConfirm){
                                for (var i = 0; i < neededModels.length; i++){
                                    if (neededModels[i].indexOf('outputters') !== -1){
                                        var outputterModel = new webgnome.model.model.outputters[neededModels[i]]();
                                        webgnome.model.get('outputters').add(outputterModel);
                                    } else if (neededModels[i].indexOf('weatherers') !== -1){
                                        var weathererModel = new webgnome.model.model.weatherers[neededModels[i]]();
                                        webgnome.model.get('weatherers').add(weathererModel);
                                    }
                                }
                                webgnome.model.save();
                                webgnome.router.navigate('config', true);
                            }
                        });
                    } else {
                        webgnome.router.navigate('config', true);
                    }
                }, this)
            });
        },

        close: function(){
            this.dropzone.disable();
            $('input.dz-hidden-input').remove();
            Backbone.View.prototype.close.call(this);
        }
    });

    return loadView;
});