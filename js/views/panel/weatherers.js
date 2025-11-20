define([
    'underscore',
    'jquery',
    'backbone',
    'views/panel/base',
    'views/form/weatherers',
    'text!templates/panel/weatherer.html'
], function(_, $, Backbone, BasePanel, WeatherersForm, WeathererPanelTemplate){
    var weathererPanel = BasePanel.extend({
        className: 'col-md-3 water object panel-view weatherer-view',

        models: [
            'gnome.weatherers.evaporation.Evaporation',
            'gnome.weatherers.emulsification.Emulsification',
            'gnome.weatherers.natural_dispersion.NaturalDispersion',
            'gnome.weatherers.dissolution.Dissolution',
        ],

		events: function() {
            return _.defaults({
                //'click input[type="checkbox"]': 'updateModel',
                'click .manual': 'resetAutomation',
                'click .valid-weathering': 'disableWeathering',
                'click #weathering-toggle': 'toggleWeathering',
                'change #available-winds': 'selectWeatheringWind',
            }, BasePanel.prototype.events);
        },

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('environment'), 'reset change', this.dbRender);
            this.listenTo(webgnome.model.get('weatherers'), 'reset', this.dbRender);
        },

        render: function(){
            var weatherers = webgnome.model.get('weatherers').filter(function(weatherer) {
                return [
                    'gnome.weatherers.evaporation.Evaporation',
                    'gnome.weatherers.emulsification.Emulsification',
                    'gnome.weatherers.natural_dispersion.NaturalDispersion',
                    'gnome.weatherers.dissolution.Dissolution',
                ].indexOf(weatherer.get('obj_type')) !== -1;
            });
            var evaporation = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.evaporation.Evaporation'});
            var dispersion = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.natural_dispersion.NaturalDispersion'});
            var emulsification = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.emulsification.Emulsification'});
            this.evaporation = evaporation;
            this.dispersion = dispersion;
            this.emulsification = emulsification;

            var wind_name;
            var no_wind = webgnome.isUorN(webgnome.model.getDefaultWind());
            if (no_wind) {
                wind_name = 'No wind';
            } else if (webgnome.isUorN(webgnome.model.getDefaultWater())) {
                // there is a wind but it's not attached to evaporation yet because there is no water
                wind_name = webgnome.model.getDefaultWind().get('name');
            } else {
                //wind_name = evaporation.get('wind').get('name');
                wind_name = webgnome.model.getDefaultWind().get('name');
            }
            
            var valid_check = 'valid';
            valid_check = webgnome.weatheringValid() || _.isUndefined(webgnome.gatherDefaultObjects()[3])? 'valid' : 'invalid';
            
            var manual_on = webgnome.getNonAutomanagedWeatherers().length > 0;

            var weathering_off = (webgnome.model.get('weatherers').models.every(function(weatherer) {
                return weatherer.get('on') === false && weatherer.get('_automanaged') === false;
            }));

            var windMovers;
            windMovers = webgnome.model.get('movers').filter(function(mover) {
                return !webgnome.isUorN(mover.get('wind'));
            });

            var compiled = _.template(WeathererPanelTemplate)({
                weatherers: weatherers,
                evaporation: evaporation,
                dispersion: dispersion,
                emulsification: emulsification,
                wind_name: wind_name,
                valid_check: valid_check,
                manual_on: manual_on,
                weathering_off: weathering_off,
                windMovers: windMovers
            });
            this.$el.html(compiled);
            this.$('.panel').addClass('complete');
            if (webgnome.model.getWeatherableSpill() || webgnome.getNonAutomanagedWeatherers().length > 0){
                this.$('.panel-body').show();
            } else {
                this.$('.panel-body').hide();
            }
            BasePanel.prototype.render.call(this);
        },

        dbRender: _.debounce(function() {
            this.render();
        }, 40),

        // updateModel: function(e) {
        //     var n = e.currentTarget.parentElement.getAttribute('name');
        //     var tgts, name;
        //     if (n === 'evap') {
        //         tgts = [this.evaporation,];
        //         name = '#evap';
        //     } else if (n === 'disp') {
        //         tgts = [this.dispersion,];
        //         name = '#disp';
        //     } else if (n === 'emul') {
        //         tgts = [this.emulsification,];
        //         name = '#emul';
        //     }

        //     var w_on;
        //     for (var i = 0; i < tgts.length; i++) {
        //         w_on = this.$( name + '_on')[0].checked;
        //         tgts[i].set('on', w_on);
        //         tgts[i].set('_automanaged', false);
        //     }
        //     webgnome.model.save();
        // },

        toggleWeathering: function(e) {
            var w_on = $(e.currentTarget)[0].checked;
            for (var i = 0; i < webgnome.model.get('weatherers').length; i++) {
                webgnome.model.get('weatherers').at(i).set('on', w_on);
                webgnome.model.get('weatherers').at(i).set('_automanaged', w_on);
            }
            webgnome.model.set('weathering_activated', w_on);
            webgnome.model.save();
        },

        selectWeatheringWind: function(e){
            //changing the select moves the wind to the top of the environment collection.
            //This is the least invasive way to make it the default weathering wind for now.
            var tgt = e.currentTarget;
            var mover_id = $(tgt).val();
            var movers = webgnome.model.get('movers');
            var wind = movers.findWhere({'id': mover_id}).get('wind');
            if (wind) {
                var envs = webgnome.model.get('environment');
                if (webgnome.model.getDefaultWind() === wind) {
                    //selected the same wind so do nothing
                    return;
                } else {
                    //selecting a new wind, so make it the first in the list
                    envs.remove(wind);
                    envs.add(wind, {at: 0});
                }
            }
            webgnome.model.save();
        },

        resetAutomation: function(e){
            var mods = webgnome.getNonAutomanagedWeatherers();
            this.$('.manual').tooltip('destroy');
            this.$('.valid-weathering').tooltip('destroy');
            this.$('.weathering-toggle').tooltip('destroy');
            //need to destroy tooltip because it can be open when setup page is rerendered
            //causing the old tooltip to stick around.
            for (var i = 0; i < mods.length; i++){
                mods[i].set('_automanaged', true);
            }
            webgnome.weatheringManageFunction().then(function(){webgnome.model.save();});
        },

        disableWeathering: function(e) {
            //this function explicitly disables weathering, even while a substance is present.
            //functionality here is tightly coupled to webgnome.weatheringManageFunction so be careful
            this.$('.valid-weathering').tooltip('destroy');
            //need to destroy tooltip because it can be open when setup page is rerendered
            //causing the old tooltip to stick around.
            var weatherers = webgnome.model.get('weatherers');
            weatherers.each(function(w){w.set('on', false);});
            weatherers.each(function(w){w.set('_automanaged', false);});
            webgnome.model.set('weathering_activated', false);
            webgnome.model.save();
        },

        togglePanel: function(tgt){
            if (tgt.target !== tgt.currentTarget || tgt.target){

            }
            var w_ac = tgt.currentTarget.checked;
            webgnome.model.set('weathering_activated', w_ac);
            if (!w_ac){
                this.$('.panel-body').hide();
            }
            //need to destroy tooltip because it can be open when setup page is rerendered
            //causing the old tooltip to stick around.
            this.$('.weathering-toggle').tooltip("destroy");
            webgnome.weatheringManageFunction().then(function(){
                webgnome.model.save();
                this.render();
            });
        },

        setupTooltips: function(){
            BasePanel.prototype.setupTooltips.call(this);
            var delay = {
                show: 500,
                hide: 100
            };

            this.$('.valid-weathering').tooltip({
                delay: delay,
                container: 'body'
            });
            this.$('.manual').tooltip({
                delay: delay,
                container: 'body',
            });
            this.$('.weathering-toggle').tooltip({
                delay: delay,
                container: 'body'
            });
        },

        new: function(){
            var weathererForm = new WeatherersForm(null, webgnome.model);
            weathererForm.on('hidden', weathererForm.close);
            //weathererForm.on('save', _.bind(webgnome.weatheringTrigger, webgnome.model.default_env_refs));
            weathererForm.render();
        }
    });

    return weathererPanel;
});