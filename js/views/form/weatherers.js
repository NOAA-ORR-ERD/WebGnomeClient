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
            return _.defaults({}, FormModal.prototype.events);
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
            this.body = _.template(WeatherersFormTemplate)({
                model: this.model,
                evaporation: this.evaporation,
                dispersion: this.dispersion,
                emulsification: this.emulsification
            });
            FormModal.prototype.render.call(this, options);
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