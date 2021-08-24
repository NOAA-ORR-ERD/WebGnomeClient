define([
    'underscore',
    'jquery',
    'backbone',
    'lcswitch',
    'views/panel/base',
    'views/form/weatherers',
    'text!templates/panel/weatherer.html'
], function(_, $, Backbone, lcswitch, BasePanel, WeatherersForm, WeathererPanelTemplate){
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
                'click input[type="checkbox"]': 'updateModel',
                'lcs-statuschange #activate-weathering': 'togglePanel'
            }, BasePanel.prototype.events);
        },

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('environment'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('weatherers'), 'change', this.render);
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
            if (webgnome.isUorN(evaporation.get('wind'))) {
                wind_name = 'No wind';
            } else {
                wind_name = evaporation.get('wind').get('name');
            }
            
            var weathering_on = (evaporation.get('on')  || dispersion.get('on') || emulsification.get('on'));
            
            var valid_check = 'valid';
            if (weathering_on) {
                valid_check = webgnome.weatheringValid() ? 'valid' : 'invalid';
                // if (valid_check === 'valid') {
                    // if (webgnome.model.get('manual_weathering')) {
                        // valid_check = 'semivalid';
                    // }
                // }                
            } 
            
            var manual_on = (webgnome.model.get('manual_weathering'));
            var activated = (webgnome.model.get('weathering_activated'));
           
            var compiled = _.template(WeathererPanelTemplate)({
                weatherers: weatherers,
                evaporation: evaporation,
                dispersion: dispersion,
                emulsification: emulsification,
                wind_name: wind_name,
                valid_check: valid_check,
                manual_on: manual_on,
                activated: activated
            });
            this.$el.html(compiled);
            this.$('.panel').addClass('complete');
            if (webgnome.model.get('weathering_activated')){
                this.$('.panel-body').show();
            } else {
                this.$('.panel-body').hide();
            }
            window.lc_switch(this.$('#activate-weathering')[0],{compact_mode: true});
            BasePanel.prototype.render.call(this);
        },

        updateModel: function(e) {
            var n = e.currentTarget.parentElement.getAttribute('name');
            var tgts, name;
            if (n === 'evap') {
                tgts = [this.evaporation,];
                name = '#evap';
            } else if (n === 'disp') {
                tgts = [this.dispersion,];
                name = '#disp';
            } else if (n === 'emul') {
                tgts = [this.emulsification,];
                name = '#emul';
            }

            var w_on;
            for (var i = 0; i < tgts.length; i++) {
                w_on = this.$( name + '_on')[0].checked;
                tgts[i].set('on', w_on);
            }
            webgnome.model.save();
        },

        togglePanel: function(tgt){
            console.log(tgt);
            var w_ac = tgt.currentTarget.checked;
            webgnome.model.set('weathering_activated', w_ac);
            if (!w_ac){
                this.$('.panel-body').hide()
            }
            webgnome.weatheringManageFunction();
            webgnome.model.save();
        },

        setupTooltips: function(){
            BasePanel.prototype.setupTooltips.call(this);
            var delay = {
                show: 500,
                hide: 100
            };

            this.$('.valid-weathering, .weathering-control').tooltip({
                delay: delay,
                container: 'body'
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