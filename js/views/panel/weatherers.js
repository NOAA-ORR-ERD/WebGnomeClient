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
            BasePanel.prototype.render.call(this);
        }
    });

    return weathererPanel;
});