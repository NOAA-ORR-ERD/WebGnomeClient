define([
    'underscore',
    'jquery',
    'backbone',
    'views/panel/base',
    'text!templates/panel/weatherer.html'
], function(_, $, Backbone, BasePanel, WeathererPanelTemplate){
    var weathererPanel = BasePanel.extend({
        className: 'col-md-3 water object weatherer-view',

        models: [
            'gnome.weatherers.evaporation.Evaporation',
            'gnome.weatherers.emulsification.Emulsification',
            'gnome.weatherers.natural_dispersion.NaturalDispersion',
            'gnome.weatherers.dissolution.Dissolution',
        ],
        events: {
            'click input[type="checkbox"]': 'updateModel'
        },

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('environment'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('weatherers'), 'change', this.render);
        },

        render: function(){
            BasePanel.prototype.render.call(this);
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
            if (_.isNull(evaporation.get('wind'))) {
                wind_name = 'No wind';
            } else {
                wind_name = evaporation.get('wind').get('name');
            }
            
            var compiled = _.template(WeathererPanelTemplate, {
                weatherers: weatherers,
                evaporation: evaporation,
                dispersion: dispersion,
                emulsification: emulsification,
                wind_name: wind_name
            });
            this.$el.html(compiled);
            this.$('.panel').addClass('complete');
            this.$('.panel-body').show();
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

            var lock, w_on, w;
            for (var i = 0; i < tgts.length; i++) {
                w = tgts[i];
                lock = this.$( name + '_lock')[0].checked;
                w_on = this.$( name + '_on')[0].checked;
                tgts[i].set('on_lock', lock);
                tgts[i].set('on', w_on);
            }
            webgnome.model.save();
        }
    });

    return weathererPanel;
});