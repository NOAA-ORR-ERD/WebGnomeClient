define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/default/roc.html',
    'views/form/model',
    'views/form/oil/library',
    'views/form/spill/type-wizcompat',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'views/form/water',
    'views/form/wind',
    'model/spill/gnomeoil',
    'model/environment/water',
    'model/environment/wind',
    'model/weatherers/roc_skim',
    'model/weatherers/roc_burn',
    'model/weatherers/roc_disperse',
    'views/form/response/roc_skim',
    'views/form/response/roc_burn',
    'views/form/response/roc_disperse'
], function($, _, Backbone, moment, ROCTemplate, ModelForm,
        OilLibraryView, SpillTypeForm, SpillInstantView, SpillContinueView, WaterForm, WindForm,
        GnomeOil, Water, Wind,
        RocSkimmerModel, RocBurnModel, RocDisperseModel,
        RocSkimmerForm, RocBurnForm, RocDisperseForm){
    'use strict';
    var rocView = Backbone.View.extend({
        className: 'page roc',

        events: {
            'click .name': 'clickName',
            'click .substance': 'clickSubstance',
            'click .spill': 'clickSpill',
            'click .water': 'clickWater',
            'click .wind': 'clickWind',
            'click .solve:not(.disabled)': 'solve',
            'click .skimmer': 'clickSkimmer',
            'click .skimmer .item': 'loadSkimmer',
            'click .burn': 'clickBurn',
            'click .burn .item': 'loadBurn',
            'click .disperse': 'clickDisperse',
            'click .disperse .item': 'loadDisperse'
        },

        initialize: function(){
            this.render();
            webgnome.model.get('spills').on('change add remove', this.render, this);
            webgnome.model.get('environment').on('change add remove', this.render, this);
            webgnome.model.get('weatherers').on('change add remove', this.render, this);
        },

        render: function(){
            var substance = webgnome.model.getSubstance();

            var start_time = moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment);
            var durationStr = webgnome.model.durationString("Model will run for ");
            var spills = webgnome.model.get('spills').models;
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.water.Water'});
            var beached = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.manual_beaching.Beaching'});
            var beached_units = (!_.isUndefined(beached)) ? beached.get('units') : false;
            var beached_ts = (!_.isUndefined(beached)) ? beached.displayTimeseries() : false;

            var filteredNames = ["ChemicalDispersion", "Skimmer", "Burn"];
            var responses = [];
            var weatherers = webgnome.model.get('weatherers').models;
            for (var i = 0; i < weatherers.length; i++){
                if (filteredNames.indexOf(weatherers[i].parseObjType()) !== -1 && weatherers[i].get('name') !== '_natural'){
                    responses.push(weatherers[i]);
                }
            }

            var compiled = _.template(ROCTemplate, {
                model: webgnome.model,
                start_time: start_time,
                durationStr: durationStr,
                substance: substance,
                spills: spills,
                wind: wind,
                wind_from: wind ? moment(wind.get('timeseries')[0][0]).format('MM-DD-YYYY H:mm') : null,
                wind_to: wind ? moment(wind.get('timeseries')[wind.get('timeseries').length - 1][0]).format('MM-DD-YYYY H:mm') : null,
                water: water,
                skimmers: webgnome.model.get('weatherers').where({'obj_type': 'gnome.weatherers.roc.Skim'}),
                burns: webgnome.model.get('weatherers').where({'obj_type': 'gnome.weatherers.roc.Burn'}),
                disperses: webgnome.model.get('weatherers').where({'obj_type': 'gnome.weatherers.roc.Disperse'})
            });

            if($('body').find(this.$el).length === 0){
                $('body').append(this.$el.append(compiled));
            } else {
                this.$el.html(compiled);
            }
            $('.tooltip').remove();
            this.$('.option, .item').tooltip({
                container: 'body'
            });
            this.$('.add').tooltip({
                container: 'body',
                placement: 'left'
            });
        },

        clickName: function() {
            var modelForm = new ModelForm({}, webgnome.model);
            modelForm.on('save wizardclose', _.bind(function(){
                this.render();
            }, this));
            modelForm.render();
        },

        clickSubstance: function(){
            var substance = new GnomeOil();
            var oilLib = new OilLibraryView({}, substance);

            oilLib.on('save wizardclose', _.bind(function() {
                if (oilLib.$el.is(':hidden')) {
                    oilLib.close();
                    webgnome.model.setGlobalSubstance(substance);
                }
                else {
                    oilLib.once('hidden', oilLib.close, oilLib);
                }
            }, this));

            oilLib.render();
        },

        clickSpill: function(e){
            e.stopPropagation();
            var spill = webgnome.model.get('spills').at(0);
            if(spill){
                var spillView;
                if (spill.get('release').get('release_time') !== spill.get('release').get('end_release_time')){
                    spillView = new SpillContinueView(null, spill);
                } else {
                    spillView = new SpillInstantView(null, spill);
                }
                spillView.$el.addClass('roc');
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
                    form.showGeo = false;
                    form.$el.addClass('roc');
                    form.on('wizardclose', form.close);
                    form.on('save', _.bind(function(){
                        webgnome.model.get('spills').add(form.model);
                        webgnome.model.save(null, {validate: false});
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
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.water.Water'});
            if(!water){
                water = new Water();
            }
            var form = new WaterForm({}, water);
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                webgnome.model.get('environment').add(water, {merge:true});
            }, this));
            form.render();
        },

        clickWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(!wind){
                wind = new Wind();
            }
            var form = new WindForm({}, {'model': wind});
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                webgnome.model.get('environment').add(wind, {merge:true});
            }, this));
            form.render();
        },

        clickSkimmer: function(){
            var skimmer = new RocSkimmerModel();
            var form = new RocSkimmerForm({model: skimmer});
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                webgnome.model.get('weatherers').add(skimmer);
                webgnome.model.save();
            }, this));
            form.render();
        },

        loadSkimmer: function(e){
            e.stopPropagation();
            var id;
            if($(e.target).hasClass('item')){
                id = $(e.target).data('id');
            } else {
                id = $(e.target).parents('.item').data('id');
            }
            
            var skimmer = webgnome.model.get('weatherers').get(id);
            var form = new RocSkimmerForm({model: skimmer});
            form.on('hidden', form.close);
            form.render();
        },

        clickBurn: function(){
            var burn = new RocBurnModel();
            var form = new RocBurnForm({model: burn});
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                webgnome.model.get('weatherers').add(burn);
                webgnome.model.save();
            }, this));
            form.render();
        },

        loadBurn: function(e){
            e.stopPropagation();
            var id;
            if($(e.target).hasClass('item')){
                id = $(e.target).data('id');
            } else {
                id = $(e.target).parents('.item').data('id');
            }
            
            var burn = webgnome.model.get('weatherers').get(id);
            var form = new RocBurnForm({model: burn});
            form.on('hidden', form.close);
            form.render();
        },

        clickDisperse: function(){
            var disperse = new RocDisperseModel();
            var form = new RocDisperseForm({model: disperse});
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                webgnome.model.get('weatherers').add(disperse);
                webgnome.model.save();
            }, this));
            form.render();
        },

        loadDisperse: function(e){
            e.stopPropagation();
            var id;
            if($(e.target).hasClass('item')){
                id = $(e.target).data('id');
            } else {
                id = $(e.target).parents('.item').data('id');
            }
            
            var disperse = webgnome.model.get('weatherers').get(id);
            var form = new RocDisperseForm({model: disperse});
            form.on('hidden', form.close);
            form.render();
        },


        solve: function(){
            localStorage.setItem('view', 'fate');
            webgnome.router.navigate('fate', true);
        },

        close: function(){
            $('.sweet-overlay').remove();
            $('.sweet-alert').remove();
            webgnome.model.get('spills').off('change add remove', this.render, this);
            webgnome.model.get('environment').off('change add remove', this.render, this);
            webgnome.model.get('weatherers').off('change add remove', this.render, this);
            Backbone.View.prototype.close.call(this);
        }
    });

    return rocView;
});
