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
                swath: 60,
                storage: 100,
                nameplate_pr: 100,
                decant_pr: 100,
                disharge_pr: 160,
                offload_time: 0,
                transit_time: 0,
                stay_on_site: false,
                barge_arrival: '',
                timeseries: this.calculateOperatingPeriods(),
                group: 'A',
                throughput: 75,
                recovery: 1,
                recovery_ef: 0,
                units:{
                    speed: 'kt',
                    swath: 'ft',
                    storage: 'bbl',
                    nameplate_pr: 'gpm',
                    decant_pr: 'gpm',
                    discharge_pr: 'gpm',
                }
            };
        }
    });
    return ROCSkimModel;
});