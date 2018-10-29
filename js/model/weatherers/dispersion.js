define([
    'underscore',
    'backbone',
    'moment',
    'model/weatherers/base',
    'model/environment/waves'
], function(_, Backbone, moment, BaseModel, WavesModel){
    'use strict';
    var dispersionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.cleanup.ChemicalDispersion',
            'name': 'Dispersion',
            'efficiency': 0.20,
            'waves': null,
        },

        model: {
            waves: Backbone.Model,
        },

        validate: function(attrs, options){
            if (_.isNaN(attrs.fraction_sprayed) || attrs.fraction_sprayed <= 0){
                return 'Percent of oil sprayed must be greater than zero!';
            }

            if (attrs.active_start === attrs.active_stop) {
                return 'Duration must be a inputted!';
            }
        },

        resetEndTime: function() {
            var timeStepLength;
            if (_.has(window, 'webgnome') && _.has(webgnome, 'model') && !_.isNull(webgnome.model)){
                timeStepLength = parseFloat(webgnome.model.get('time_step'));
            } else {
                timeStepLength = 900;
            }
            var start_time = moment(this.get('active_start')).unix();
            var new_end_time = moment((start_time + timeStepLength) * 1000);
            this.set('active_stop', new_end_time.format());
        },

        toTree: function(){
            return '';
        }
    });

    return dispersionWeatherer;
});