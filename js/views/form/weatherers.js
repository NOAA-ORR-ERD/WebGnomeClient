define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/weatherers.html'
], function($, _, Backbone, module, FormModal, WeatherersFormTemplate){
    'use strict';
    var weatherersForm = FormModal.extend({
        title: 'Weatherers',

		events: function() {
            return _.defaults({
                'click #enable-weathering': 'enableWeathering',
            }, FormModal.prototype.events);
        },

        initialize: function(options, gnomeModel) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            if (!_.isUndefined(gnomeModel)){
                this.model = gnomeModel;
            } else {
                this.model = webgnome.model;
            }
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
        },

        render: function(options) {

            var enabled = !(this.model.get('weatherers').models.every(function(weatherer) {
                return weatherer.get('on') === false && weatherer.get('_automanaged') === false;
            }));
            this.body = _.template(WeatherersFormTemplate)({
                model: this.model,
                evaporation: this.evaporation,
                dispersion: this.dispersion,
                emulsification: this.emulsification,
                enabled: enabled
            });
            FormModal.prototype.render.call(this, options);
        },

        enableWeathering: function(e) {
            var w_on = this.$('#enable-weathering')[0].checked;
            for (var i = 0; i < this.model.get('weatherers').length; i++) {
                this.model.get('weatherers').at(i).set('on', w_on);
                this.model.get('weatherers').at(i).set('_automanaged', w_on);
                this.$('.checkbox-inline').prop('checked', w_on);
            }
            this.$el.html('');
            this.render();


        },

        update: function(e) {
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
                w_on = this.$( name )[0].checked;
                tgts[i].set('on', w_on);
                tgts[i].set('_automanaged', false);
            }
        }
    });

    return weatherersForm;
});