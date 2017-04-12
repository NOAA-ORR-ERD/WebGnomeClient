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
                pass_type: 'bidirectional',
                disp_oil_ratio: 20,
                dosage_type: 'auto',
                dosage: null,
                dispersant: '1',
                disp_eff: null,
                loading_type: 'simultaneous',
                units: new Backbone.Model({
                    pass_length: 'nm',
                    transit: 'nm',
                    dosage: 'gal/acre',
		            cascade_distance: 'nm'
                })
            };
        },

        model: {
            units: Backbone.Model,
            platform: Platform
        },

    	initialize: function(options) {
    		ROCWeatherer.prototype.initialize.call(this, options);
    	},

    });
    return ROCDisperseModel;
});
