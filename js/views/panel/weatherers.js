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
            this.listenTo(webgnome.model.get('environment'), 'change add remove', this.rerender);
            this.listenTo(webgnome.model.get('weatherers'), 'change', this.rerender);
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

            var compiled = _.template(WeathererPanelTemplate, {
                weatherers: weatherers
            });
            this.$el.html(compiled);
            this.$('.panel').addClass('complete');
            this.$('.panel-body').show();
            BasePanel.prototype.render.call(this);
        }
    });

    return weathererPanel;
});