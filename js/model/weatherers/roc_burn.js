define([
    'underscore',
    'backbone',
    'model/weatherers/roc',
], function(_, Backbone, ROCWeatherer){
    var ROCBurnModel = ROCWeatherer.extend({
        defaults: function(){
            return {
                obj_type: 'gnome.weatherers.roc.Burn',
                name: 'ROC Burn',
                timeseries: this.calculateOperatingPeriods(),
                offset: 500,
                boom_length: 200,
                boom_draft: 12,
                speed: 0.75,
                throughput: 0.75,
                _throughput: 75,
                burn_efficiency_type: '1',
                burn_efficiency_custom: 0,
                _burn_efficiency_custom: 0,
                units: new Backbone.Model({
                    offset: 'ft',
                    boom_length: 'ft',
                    boom_draft: 'in',
                    speed: 'knots'
                })
            };
        },

        models: {
            units: Backbone.Model
        },

        initialize: function(options){
            ROCWeatherer.prototype.initialize.call(this, options);
            this.on('change:_throughput', this.percentToDecimal('throughput'));
            this.on('change:_burn_efficiency_custom', this.percentToDecimal('burn_efficiency_custom'));
        },
        
        parse: function(attributes){
            attributes = ROCWeather.prototype.parse.call(this, options);
            attributes._throughput = this.decimalToPercent('throughput');
            attributes._burn_efficiency_custom = this.decimalToPercent('burn_efficiency_custom');
        }
    });
    return ROCBurnModel;
});