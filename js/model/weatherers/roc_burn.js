define([
    'underscore',
    'backbone',
    'model/weatherers/roc',
], function(_, Backbone, ROCWeatherer){
    var ROCBurnModel = ROCWeatherer.extend({
        defaults: function(){
            return {
                obj_type: 'gnome.weatherers.ROC.Burn',
                name: 'ROC Burn',
                timeseries: this.calculateOperatingPeriods(),
                offset: 500,
                boom_length: 200,
                boom_draft: 12,
                speed: 0.75,
                throughput: 75,
                burn: '1',
                burn_ef: 0,
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
        }
    });
    return ROCBurnModel;
});