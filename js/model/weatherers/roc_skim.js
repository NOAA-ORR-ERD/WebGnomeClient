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
                offload: 15,
                rig_time: 15,
                transit_time: 30,
                offload_to: 'shore',
                barge_arrival: '',
                timeseries: this.calculateOperatingPeriods(),
                group: 'A',
                skim_efficiency_type: '1',
                _throughput: 75,
                throughput: 0.75,
                recovery: '1',
                recovery_ef: 0.75,
                _recovery_ef: 75,
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
            this.on('change:_throughput', this.percentToDecimal('throughput'));
            this.on('change:_recovery_ef', this.percentToDecimal('recovery_ef'));
        },

        parse: function(attributes){
            attributes = ROCWeatherer.prototype.parse.call(this, attributes);
            attributes._decant = this.decimalToPercent(attributes.decant);
            attributes._throughput = this.decimalToPercent(attributes.throughput);
            attributes._recovery_ef = this.decimalToPercent(attributes.recovery_ef);
            return attributes;
        }
    });
    return ROCSkimModel;
});
