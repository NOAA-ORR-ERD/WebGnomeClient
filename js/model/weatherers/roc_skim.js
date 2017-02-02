define([
    'underscore',
    'backbone',
    'model/weatherers/roc',
], function(_, Backbone, ROCWeatherer){
    var ROCSkimModel = ROCWeatherer.extend({
        defaults: function(){
            return {
                obj_type: 'gnome.weatherers.ROC.Skimmer',
                name: 'ROC Skimmer',
                speed: 0.75,
                decant: 0,
                _decant: 0,
                swath: 60,
                storage: 100,
                nameplate_pump: 100,
                decant_pump: 100,
                disharge_pump: 160,
                offload_time: 0,
                transit_time: 0,
                offload_to: 'shore',
                barge_arrival: '',
                timeseries: this.calculateOperatingPeriods(),
                group: 'A',
                _throughput: 75
                throughput: 0.75,
                recovery: '1',
                recovery_ef: 0,
                units: new Backbone.Model({
                    speed: 'knots',
                    swath: 'ft',
                    storage: 'bbl',
                    nameplate_pr: 'gpm',
                    decant_pr: 'gpm',
                    discharge_pr: 'gpm',
                })
            };
        },

        models: {
            units: Backbone.Model
        },

        initialize: function(){
            ROCWeatherer.prototype.initialize.call(this, options);
            this.on('change:_decant', this.percentToDecimal('decant'));
        },

        parse: function(attributes){
            attrbitues = ROCWeatherer.prototype.parse.call(this, options);
            attributes._decant = this.decimalToPercent('decant');
            return attributes;
        }
    });
    return ROCSkimModel;
});
