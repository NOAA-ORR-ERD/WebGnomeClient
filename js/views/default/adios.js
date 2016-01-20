define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/default/adios.html',
    'views/form/oil/library',
    'views/form/spill/type-wizcompat',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'views/form/water',
    'views/form/wind',
    'model/element',
    'model/environment/water',
    'model/environment/wind'
], function($, _, Backbone, moment, AdiosTemplate,
        OilLibraryView, SpillTypeForm, SpillInstantView, SpillContinueView, WaterForm, WindForm,
        ElementType, Water, Wind){
    'use strict';
    var adiosView = Backbone.View.extend({
        className: 'page adios',

        events: {
            'click .substance': 'clickSubstance',
            'click .spill': 'clickSpill',
            'click .water': 'clickWater',
            'click .wind': 'clickWind',
            'click .solve:not(.disabled)': 'solve'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var element_type = webgnome.model.getElementType();
            var substance = false;

            if(element_type){
                substance = element_type.get('substance');
            }

            var spills = webgnome.model.get('spills').models;
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.environment.Water'});
            var compiled = _.template(AdiosTemplate, {
                substance: substance,
                spills: spills,
                wind: wind,
                wind_from: wind ? moment(wind.get('timeseries')[0][0]).format('MM-DD-YYYY H:mm') : null,
                wind_to: wind ? moment(wind.get('timeseries')[wind.get('timeseries').length - 1][0]).format('MM-DD-YYYY H:mm') : null,
                water: water
            });
            if($('body').find(this.$el).length == 0){
                $('body').append(this.$el.append(compiled));
            } else {
                this.$el.html(compiled);
            }
        },

        clickSubstance: function(){
            var spills = webgnome.model.get('spills');
            var element_type;
            if(spills.length > 0){
                element_type = webgnome.model.get('spills').at(0).get('element_type');
            } else {
                element_type = new ElementType();
            }
            var oilLib = new OilLibraryView({}, element_type);
            oilLib.on('save wizardclose', _.bind(function(){
                element_type.save().always(_.bind(function(){
                    webgnome.obj_ref[element_type.id] = element_type;
                    this.render();
                    webgnome.model.updateElementType(element_type);
                    webgnome.model.save();
                }, this));
                oilLib.close();
            }, this));
            oilLib.render();
        },

        clickSpill: function(){
            var spill = webgnome.model.get('spills').at(0);
            if(spill){
                var spillView;
                if (spill.get('release').get('release_time') !== spill.get('release').get('end_release_time')){
                    spillView = new SpillContinueView(null, spill);
                } else {
                    spillView = new SpillInstantView(null, spill);
                }
                spillView.$el.addClass('adios');
                spillView.on('save wizardclose', _.bind(function(){
                    this.render();
                }, this));
                spillView.on('save', function(){
                    spillView.on('hidden', spillView.close);
                });
                spillView.on('wizardclose', spillView.close);

                spillView.render();
            } else {
                var spillTypeForm = new SpillTypeForm();
                spillTypeForm.render();
                spillTypeForm.on('hidden', spillTypeForm.close);
                spillTypeForm.on('select', _.bind(function(form){
                    form.$el.addClass('adios');
                    form.on('save wizardclose', _.bind(function(){
                        webgnome.model.get('spills').add(form.model);
                        this.render();
                        if(form.$el.is(':hidden')){
                            form.close();
                        } else {
                            form.once('hidden', form.close, form);
                        }
                    }, this));
                }, this));
            }
        },

        clickWater: function(){
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.environment.Water'});
            if(!water){
                water = new Water();
            }
            var form = new WaterForm({}, water);
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                webgnome.model.get('environment').add(water, {merge:true});
                this.render();
            }, this));
            form.render();
        },

        clickWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(!wind){
                wind = new Wind();
            }
            var form = new WindForm({}, wind);
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                webgnome.model.get('environment').add(wind, {merge:true});
                this.render();
            }, this));
            form.render();
        },

        solve: function(){
            webgnome.router.navigate('/model', true);
        },

        close: function(){
            $('.sweet-overlay').remove();
            $('.sweet-alert').remove();
            Backbone.View.prototype.close.call(this);
        }
    });

    return adiosView;
});