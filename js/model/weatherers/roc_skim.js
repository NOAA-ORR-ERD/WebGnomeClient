define([
    'underscore',
    'backbone',
    'model/weatherers/roc',
], function(_, Backbone, ROCWeatherer){
    var ROCSkimModel = ROCWeatherer.extend({
        defaults: function(){
            return {
                obj_type: 'gnome.weatherers.roc.Skim',
                name: 'ROC Skimmer',
                speed: 0.75,
                decant: 0,
                _decant: 0,
                swath_width: 60,
                storage: 100,
                nameplate_pump: 100,
                decant_pump: 100,
                discharge_pump: 160,
                offload: 0,
                rig_time: 0,
                transit_time: 0,
                offload_to: 'shore',
                barge_arrival: '',
                timeseries: this.calculateOperatingPeriods(),
                group: 'A',
                skim_efficiency_type: '1',
                _throughput: 75,
                throughput: 0.75,
                recovery: '1',
                recovery_ef: 0,
                units: new Backbone.Model({
                    speed: 'knots',
                    swath: 'ft',
                    storage: 'bbl',
                    nameplate_pump: 'gpm',
                    decant_pump: 'gpm',
                    discharge_pump: 'gpm',
                    swath_width: 'ft'
                })
            };
        },

        models: {
            units: Backbone.Model
        },

        initialize: function(options){
            ROCWeatherer.prototype.initialize.call(this, options);
            this.on('change:_decant', this.percentToDecimal('decant'));
        },

        parse: function(attributes){
            attributes = ROCWeatherer.prototype.parse.call(this, attributes);
            attributes._decant = this.decimalToPercent('decant');
            return attributes;
        }
    });
    return ROCSkimModel;
});
