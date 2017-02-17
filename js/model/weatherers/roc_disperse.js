define([
    'underscore',
    'backbone',
    'model/weatherers/roc',
    'model/platform'
], function(_, Backbone, ROCWeatherer, Platform){
    var ROCDisperseModel = ROCWeatherer.extend({
        defaults: function(){
            return {
                obj_type: 'gnome.weatherers.roc.Disperse',
                name: 'ROC Disperse',
                timeseries: this.calculateOperatingPeriods(),
                transit: 10,
                pass_length: 4,
                platform: new Platform(),
                platform_type: '',
                pass_type: 'bidirectional',
                dor: 20,
                dosage_type: 'auto',
                dosage: 0,
                dispersant: '1',
                dispersant_ef: 0,
                loading_type: 'simultaneous',
                units: new Backbone.Model({
                    pass_length: 'nm',
                    transit: 'nm',
                    dosage_val: 'gallon/acre',
                })
            };
        },

        models: {
            units: Backbone.Model,
            platform: Platform
        }
    });
    return ROCDisperseModel;
});
