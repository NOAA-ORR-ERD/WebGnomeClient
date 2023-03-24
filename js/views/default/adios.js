define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/default/adios.html',
    'views/form/model',
    'views/form/oil/upload',
    'views/form/spill/type',
    'views/form/spill/continue',
    'views/form/water',
    'views/form/mover/wind',
    'views/form/response/type',
    'views/form/response/disperse',
    'views/form/response/insituBurn',
    'views/form/response/skim',
    'views/form/beached',
    'model/environment/water',
    'model/environment/wind',
    'model/movers/wind',
    'model/spill/gnomeoil',
    'model/spill/nonweatheringsubstance'
], function($, _, Backbone, moment, AdiosTemplate, ModelForm,
        OilUploadForm, SpillTypeForm, SpillContinueView, WaterForm, WindForm, ResponseType, ResponseDisperseView, ResponseBurnView, ResponseSkimView,
        BeachedView, Water, Wind, WindMover, GnomeOil, NonWeatheringSubstance){
    'use strict';
    var adiosView = Backbone.View.extend({
        className: 'page adios',

        events: {
            'click .name': 'clickName',
            'click .substance': 'clickSubstance',
            'click .spill': 'clickSpill',
            'click .water': 'clickWater',
            'click .wind': 'clickWind',
            'click .solve:not(.disabled)': 'solve',
            'click .response': 'clickResponse',
            'click .response .item': 'loadResponse',
            'click .beached': 'clickBeached'
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

            var tmpl = _.template(AdiosTemplate);
            var compiled = tmpl({
                model: webgnome.model,
                start_time: start_time,
                durationStr: durationStr,
                substance: substance,
                spills: spills,
                wind: wind,
                wind_from: wind ? moment(wind.get('timeseries')[0][0]).format('MM-DD-YYYY H:mm') : null,
                wind_to: wind ? moment(wind.get('timeseries')[wind.get('timeseries').length - 1][0]).format('MM-DD-YYYY H:mm') : null,
                water: water,
                responses: responses,
                beached_units: beached_units,
                beached_ts: beached_ts
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
            if(webgnome.model.get('name') === 'ADIOS Model_'){
                webgnome.model.set('name', 'ADIOS Model');
            }
            modelForm.on('save wizardclose', _.bind(function(){
                this.render();
            }, this));
            modelForm.render();
        },

        clickSubstance: function(){

            var substance = webgnome.model.getSubstance();
            if(!substance){
                substance = new NonWeatheringSubstance();
            }
            var oilForm = new OilUploadForm({}, substance);
            oilForm.on('hidden', oilForm.close);
            oilForm.$el.addClass('adios');
            oilForm.on('save', _.bind(function(){
                webgnome.model.save(null, {validate: false});
                this.render();
            }, this));
            oilForm.render();
        },

        clickSpill: function(e){
            e.stopPropagation();
            var spill = webgnome.model.get('spills').at(0);
            if(spill){
                var spillView;
                spillView = new SpillContinueView(null, spill);
                spillView.$el.addClass('adios');
                spillView.on('save', function(){
                    spillView.on('hidden', spillView.close);
                });
                spillView.on('wizardclose', spillView.close);

                spillView.render();
            } else {
                var spillTypeForm = new SpillTypeForm({adios: true});
                spillTypeForm.render();
                spillTypeForm.on('hidden', spillTypeForm.close);
                spillTypeForm.on('select', _.bind(function(form){
                    form.showGeo = false;
                    form.$el.addClass('adios');
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
                webgnome.model.save(null, {validate: false});
            }, this));
            form.render();
        },

        clickWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(!wind){
                wind = new Wind();
            }
            var windMover = webgnome.model.get('movers').findWhere({obj_type: 'gnome.movers.c_wind_movers.PointWindMover'});
            if(!windMover){
                windMover = new WindMover();
            }
            windMover.set('wind', wind);
            windMover.set('extrapolate', true);
            var windForm = new WindForm(null, {'superModel': windMover, 'model': windMover.get('wind')});
            windForm.on('hidden', windForm.close);
            windForm.on('save', _.bind(function(){
                webgnome.model.get('movers').add(windMover);
                webgnome.model.get('environment').add(windMover.get('wind'));
                webgnome.model.save(null, {validate: false});
            }, this));
            windForm.render();
        },

        solve: function(){
            localStorage.setItem('view', 'fate');
            webgnome.router.navigate('fate', true);
        },

        clickResponse: function(){
            var form = new ResponseType();
            form.render();
            form.on('hidden', form.close);
        },

        loadResponse: function(e){
            e.stopPropagation();
            var id;
            if($(e.target).hasClass('item')){
                id = $(e.target).data('id');
            } else {
                id = $(e.target).parents('.item').data('id');
            }
            var response = webgnome.model.get('weatherers').get(id);
            var responseView;
            var nameArray = response.get('obj_type').split('.');
            switch (nameArray[nameArray.length - 1]){
                case "ChemicalDispersion":
                    responseView = new ResponseDisperseView(null, response);
                    break;
                case "Burn":
                    responseView = new ResponseBurnView(null, response);
                    break;
                case "Skimmer":
                    responseView = new ResponseSkimView(null, response);
                    break;
            }
            responseView.on('wizardclose', function(){
                responseView.on('hidden', responseView.close);
            });
            responseView.on('save', _.bind(function(){
                webgnome.model.save(null, {validate: false});
                responseView.on('hidden', responseView.close);
            }, this));
            responseView.render();
        },

        clickBeached: function() {
            var beached = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.manual_beaching.Beaching'});
            var form = new BeachedView({}, beached);
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                webgnome.model.get('weatherers').add(form.model, {merge:true});
                webgnome.model.save(null, {validate: false});
            }, this));
            form.render();
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

    return adiosView;
});